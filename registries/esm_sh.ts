import { Registry } from '../registry.ts'
import { npm } from './npm.ts'

export const esm_sh = new Registry({
  config: {
    name: 'esm.sh',
    importType: 'url',
    regex:
      /^https:\/\/esm\.sh\/(@[0-9a-zA-Z.-]+\/)?[0-9a-zA-Z.-]+@[^@]+(\/[^\/]+)*$/,
  },

  async versions(moduleName) {
    return await npm.options.versions(moduleName)
  },

  async repositoryUrl({ moduleName }) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      return
    }

    const { repository } = await res.json() as { repository: { url: string } }

    return repository.url.replace('.git', '').replace('git+', '')
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl

    const p = pathname.split('/')

    const moduleName = p[1].startsWith('@')
      ? `${p[1]}/${p[2].split('@')[0]}`
      : p[1].split('@')[0]

    const version = p[1].startsWith('@')
      ? p[2].split('@')[1]
      : p[1].split('@')[1]

    return {
      moduleName,
      version,
    }
  },
})
