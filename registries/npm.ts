import { Registry } from '../script/registry.ts'

export const npm = new Registry({
  config: {
    name: 'npm',
    importType: 'string',
    regex: /^npm:(@[0-9a-zA-Z.-]+\/)?[0-9a-zA-Z.-]+@[^@]+$/,
  },

  async versions(moduleName) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      return []
    }

    const { versions } = await res.json() as { versions: string[] }

    return Object.keys(versions)
  },

  async repositoryUrl(moduleName) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      return
    }

    const { repository } = await res.json() as { repository: { url: string } }

    return repository.url.replace('.git', '').replace('git+', '')
  },

  parseImport({ importString }) {
    const moduleName = importString.substring(4) // remove npm:

    const version = moduleName.startsWith('@')
      ? moduleName.split('/')[1].split('@')[1] // scoped module
      : moduleName.split('@')[1] // non-scoped module

    return {
      moduleName,
      version,
    }
  },
})
