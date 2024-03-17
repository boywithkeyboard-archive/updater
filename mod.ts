import * as colors from 'std/fmt/colors.ts'
import { cli } from './original_cli/script/main.ts'

if (import.meta.main) {
  console.warn(
    colors.red(
      colors.bold('The CLI is no longer supported!') + ' ' +
        'Please use the boywithkeyboard/updater GitHub action instead!',
    ),
  )

  cli()
}

export { checkImport } from './original_cli/script/checkImport.ts'
export { update } from './original_cli/script/update.ts'
