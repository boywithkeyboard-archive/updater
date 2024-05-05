import slash from 'slash'
import { parseArgs } from 'std/cli/mod.ts'
import { gray } from 'std/fmt/colors.ts'
import { walkSync } from 'std/fs/walk.ts'
import {
    globToRegExp,
    isAbsolute,
    isGlob,
    join,
    relative,
} from 'std/path/mod.ts'
import { version } from '../version.js'
import { parseConfig } from './parseConfig.js'
import { stat } from './stat.js'
import { update } from './update.js'

function hasFileWithExt(ext: string) {
  for (const entry of walkSync(Deno.cwd())) {
    if (entry.isFile && entry.path.endsWith(ext)) {
      return true
    }
  }

  return false
}

function execTask(taskName: string) {
  const cmd = new Deno.Command('deno', {
    args: ['task', '--config', './__updater_deno.json', taskName],
  })

  const output = cmd.outputSync()

  return output.success
}

function typeCheck(taskName: string) {
  const cmd = new Deno.Command('deno', {
    args: ['task', '--config', './__updater_deno.json', taskName],
  })

  const output = cmd.outputSync()

  const stderr = new TextDecoder().decode(output.stderr)

  console.log(stderr)

  return {
    success: output.success,
    stderr,
  }
}

const labels = {
  unstable: '🚧',
  breaking: '⚠️',
  early: '🤞',
}

export async function cli() {
  const config = parseConfig()

  const args = parseArgs(Deno.args)

  args._ = args._.filter((i: unknown) => typeof i === 'string')

  const paths = args._.length > 0 ? args._ as string[] : [Deno.cwd()]

  const parsedArgs = {
    allowBreaking: args.breaking ?? args.b ?? config.allowBreaking ?? false,
    allowUnstable: args.unstable ?? args.u ?? config.allowUnstable ?? false,
    logging: true,
    readOnly: args['dry-run'] ?? args['readonly'] ?? config.readOnly ?? false,
  }

  if (typeof parsedArgs.allowBreaking === 'string') {
    parsedArgs.allowBreaking = parsedArgs.allowBreaking === 'true'
  }

  if (typeof parsedArgs.allowUnstable === 'string') {
    parsedArgs.allowUnstable = parsedArgs.allowUnstable === 'true'
  }

  let files: string[] = []

  // resolve input files/dirs
  for (let path of paths) {
    if (!isAbsolute(path)) {
      path = join(Deno.cwd(), path)
    }

    const s = stat(path)

    if (!s) {
      continue
    }

    if (s.isDirectory) {
      for (
        const entry of walkSync(path, {
          skip: [/\.git/, /\.vscode/],
          followSymlinks: false,
          exts: ['.jsx', '.tsx', '.js', '.ts', '.mjs', '.md', '.mdx', '.json'],
        })
      ) {
        if (entry.isFile) {
          files.push(relative(Deno.cwd(), entry.path))
        }
      }
    } else if (s.isFile) {
      files.push(path)
    }
  }

  files = files.map((path) => {
    if (!path.startsWith('../')) {
      path = './' + path
    }

    return slash(path)
  })

  // parse include/exclude

  if (config.include) {
    if (typeof config.include === 'string') {
      if (isGlob(config.include)) {
        const regex = globToRegExp(config.include, { extended: true })

        files = files.filter((path) => regex.test(path))
      } else {
        if (isAbsolute(config.include)) {
          config.include = relative(Deno.cwd(), config.include)
        }

        files = files.filter((path) => path === config.include)
      }
    } else {
      for (let pattern of config.include) {
        if (isGlob(pattern)) {
          const regex = globToRegExp(pattern, { extended: true })

          files = files.filter((path) => regex.test(path))
        } else {
          if (isAbsolute(pattern)) {
            pattern = relative(Deno.cwd(), pattern)
          }

          files = files.filter((path) => path === pattern)
        }
      }
    }
  }

  if (config.exclude) {
    if (typeof config.exclude === 'string') {
      if (isGlob(config.exclude)) {
        const regex = globToRegExp(config.exclude, { extended: true })

        files = files.filter((path) => !regex.test(path))
      } else {
        if (isAbsolute(config.exclude)) {
          config.exclude = relative(Deno.cwd(), config.exclude)
        }

        files = files.filter((path) => path !== config.exclude)
      }
    } else {
      for (let pattern of config.exclude) {
        if (isGlob(pattern)) {
          const regex = globToRegExp(pattern, { extended: true })

          files = files.filter((path) => !regex.test(path))
        } else {
          if (isAbsolute(pattern)) {
            pattern = relative(Deno.cwd(), pattern)
          }

          files = files.filter((path) => path !== pattern)
        }
      }
    }
  }

  const { filesChecked, changes } = await update(files, parsedArgs)

  const createChangelog = args.changelog ?? args.c ?? false

  if (changes.length === 0) {
    console.info(
      gray(
        `Checked ${filesChecked} file${
          filesChecked > 1 ? 's' : ''
        }, no updates available.`,
      ),
    )

    if (createChangelog) {
      await Deno.writeTextFile('./updates_changelog.md', '')
    }

    Deno.exit()
  }

  // create markdown file

  if (!createChangelog) {
    Deno.exit()
  }

  const sortedChanges: Record<
    string,
    Awaited<ReturnType<typeof update>>['changes']
  > = {
    'cdn.jsdelivr.net': [],
    'deno.land': [],
    'deno.re': [],
    'denopkg.com': [],
    'esm.sh': [],
    'jsr': [],
    'npm': [],
    'raw.githubusercontent.com': [],
  }

  let changelog = '#\n\n'

  for (const change of changes) {
    sortedChanges[change.registryName].push(change)
  }

  for (const [registryName, changes] of Object.entries(sortedChanges)) {
    if (changes.length === 0) {
      continue
    }

    if (changelog === '') {
      changelog += `- **${registryName}**\n\n`
    } else {
      changelog += `\n\n- **${registryName}**\n\n`
    }

    const arr = [
      ...new Set(changes.map((change) => {
        return `  - [${change.moduleName}](${change.repositoryUrl}) × \`${change.oldVersion}\` → \`${
          change.type ? `${labels[change.type]} ` : ''
        }${change.newVersion}\``
      })),
    ]

    changelog += arr.join('\n')
  }

  // add temporary deno.json config
  Deno.writeTextFileSync(
    './__updater_deno.json',
    JSON.stringify(
      {
        tasks: {
          check_ts: 'deno check **/*.ts',
          check_js: 'deno check **/*.js',
          check_mjs: 'deno check **/*.mjs',
          cache_all:
            'deno cache **/*.ts && deno cache **/*.js && deno cache **/*.mjs',
        },
      },
      null,
      2,
    ),
  )

  let typeCheckingSucceeded = true
  const failedOn: string[] = []

  if (typeCheckingSucceeded && hasFileWithExt('.ts')) {
    const result = typeCheck('check_ts')

    typeCheckingSucceeded = result.success

    if (!typeCheckingSucceeded) {
      failedOn.push('.ts')
    }
  }

  if (typeCheckingSucceeded && hasFileWithExt('.js')) {
    const result = typeCheck('check_js')

    typeCheckingSucceeded = result.success

    if (!typeCheckingSucceeded) {
      failedOn.push('.js')
    }
  }

  if (typeCheckingSucceeded && hasFileWithExt('.mjs')) {
    const result = typeCheck('check_mjs')

    typeCheckingSucceeded = result.success

    if (!typeCheckingSucceeded) {
      failedOn.push('.mjs')
    }
  }

  if (!typeCheckingSucceeded) {
    changelog =
      `> [!CAUTION]\\\n> \`deno check\` failed on some ${
        failedOn.map((item) => `\`${item}\``).join(', ').replace(
          /,(?=[^,]+$)/,
          ', and',
        )
      } files.\n` + changelog
  }

  let importsCount = 0
  const _files: string[] = []

  for (const change of changes) {
    _files.push(change.filePath)
    importsCount++
  }

  changelog +=
    `\n\n#\n\n**updater ${version}** × This pull request modifies ${importsCount} imports in ${
      [...new Set(_files)].length
    } files.`

  Deno.writeTextFileSync('./updates_changelog.md', changelog)

  // remove old lock file
  let hadLockFile = false

  try {
    const stat = Deno.statSync('./deno.lock')

    if (stat.isFile) {
      hadLockFile = true

      Deno.removeSync('./deno.lock')
    }
  } catch (_err) {
    //
  }

  // generate new lock file
  if (hadLockFile) {
    execTask('cache_all')
  }

  // remove temporary deno.json config
  Deno.removeSync('./__updater_deno.json')

  Deno.exit()
}
