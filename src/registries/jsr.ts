import { Registry } from '../registry'

export const jsr = new Registry({
  config: {
    name: 'jsr',
    importType: 'string',
    regex: /^jsr:(@[0-9a-zA-Z.-]+\/)?[0-9a-zA-Z.-^]+@[^@]+$/
  },

  async versions(moduleName) {
    const res = await fetch(`https://jsr.io/${moduleName}/meta.json`, {
      headers: {
        Accept: 'application/json'
      }
    })

    if (!res.ok) {
      await res.body?.cancel()

      return []
    }

    const { versions } = await res.json() as {
      versions: Record<string, unknown>
    }

    return Object.keys(versions)
  },

  repositoryUrl() {
    return undefined
  },

  parseImport({ importString }) {
    let moduleName = importString.slice(4)

    const version = moduleName.charAt(0) === '@'
      ? moduleName.split('/')[1].split('@')[1] // scoped module
      : moduleName.split('@')[1] // non-scoped module

    moduleName = moduleName.startsWith('@')
      ? moduleName.split('@').slice(0, 2).join('@')
      : moduleName.split('@')[0] // non-scoped module

    return {
      moduleName,
      version
    }
  }
})
