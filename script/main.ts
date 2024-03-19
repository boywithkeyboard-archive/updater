import { parseArgs } from 'https://deno.land/std@0.220.1/cli/mod.ts'
import { gray } from 'https://deno.land/std@0.220.1/fmt/colors.ts'
import { walkSync } from 'https://deno.land/std@0.220.1/fs/walk.ts'
import { update } from '../script/update.ts'

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
  return execTask(taskName)
}

const labels = {
  unstable: '🚧',
  breaking: '⚠️',
  early: '🤞',
}

export async function cli() {
  const args = parseArgs(Deno.args)

  args._ = args._.filter((i) => typeof i === 'string')

  const files = args._.length > 0 ? args._ as string[] : [Deno.cwd()]

  const parsedArgs = {
    allowBreaking: args.breaking ?? args.b ?? false,
    allowUnstable: args.unstable ?? args.u ?? false,
    logging: true,
    readOnly: args['dry-run'] ?? args['readonly'] ?? false,
  }

  if (typeof parsedArgs.allowBreaking === 'string') {
    parsedArgs.allowBreaking = parsedArgs.allowBreaking === 'true'
  }

  if (typeof parsedArgs.allowUnstable === 'string') {
    parsedArgs.allowUnstable = parsedArgs.allowUnstable === 'true'
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
    'den.ooo': [],
    'deno.land': [],
    'esm.sh': [],
    'jsr': [],
    'npm': [],
    'raw.githubusercontent.com': [],
  }

  let changelog = ''

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
    typeCheckingSucceeded = typeCheck('check_ts')

    if (!typeCheckingSucceeded) {
      failedOn.push('.ts')
    }
  }

  if (typeCheckingSucceeded && hasFileWithExt('.js')) {
    typeCheckingSucceeded = typeCheck('check_js')

    if (!typeCheckingSucceeded) {
      failedOn.push('.js')
    }
  }

  if (typeCheckingSucceeded && hasFileWithExt('.mjs')) {
    typeCheckingSucceeded = typeCheck('check_mjs')

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
      } files.\n\n` +
      changelog
  }

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
