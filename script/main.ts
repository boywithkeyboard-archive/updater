import { parseArgs } from 'std/cli/mod.ts'
import { gray } from 'std/fmt/colors.ts'
import { update } from '../script/update.ts'

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

  await Deno.writeTextFile('./updates_changelog.md', changelog)

  Deno.exit()
}
