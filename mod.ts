import { cli } from './script/main.ts'
import * as colors from 'https://deno.land/std@0.220.1/fmt/colors.ts'

if (import.meta.main) {
  colors.brightRed(
    `${
      colors.bold('The CLI is no longer supported.')
    } Please use updater's GitHub action instead!`,
  )

  cli()
}

export { checkImport } from './script/checkImport.ts'
export { update } from './script/update.ts'
