import { parse } from 'https://deno.land/std@0.197.0/flags/mod.ts'
import { analyze } from './analyze.ts'
import { update } from './update.ts'

if (import.meta.main) {
  const args = parse(Deno.args)

  const files = await analyze(args._[0] as string ?? Deno.cwd())

  await update({
    files,
    allowBreaking: args.breaking ?? args.b ?? false,
    allowUnstable: args.unstable ?? args.u ?? false,
    createChangelog: args.changelog ?? args.c ?? false,
  })
}

export { analyze } from './analyze.ts'
export * from './types.ts'
export { update } from './update.ts'
