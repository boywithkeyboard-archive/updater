import { cli } from './script/main.ts'

if (import.meta.main) {
  cli()
}

export { checkImport } from './script/checkImport.ts'
export { update } from './script/update.ts'
