import { parse } from 'std/flags/mod.ts'
import { update } from '../script/update.ts'

export async function cli() {
  const args = parse(Deno.args)

  args._ = args._.filter((i) => typeof i === 'string')

  const files = args._.length > 0 ? args._ as string[] : [Deno.cwd()]

  const results = await update(files, {
    allowBreaking: args.breaking ?? args.b ?? false,
    allowUnstable: args.unstable ?? args.u ?? false,
    logging: true,
    readOnly: args['dry-run'] ?? args['readonly'] ?? false,
  })

  // create markdown file
}
