import { cli } from './script/main.ts'

if (import.meta.main) {
  cli()
}

export { checkImport } from './script/check_import.ts'
export { update } from './script/update.ts'
