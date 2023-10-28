import { Registry } from '../script/registry.ts'
import { npm } from './npm.ts'

export const esm_sh = new Registry({
  config: {
    name: 'esm.sh',
    importType: 'url',
    regex:
      /^https:\/\/esm\.sh\/(@[0-9a-zA-Z.-]+\/)?[0-9a-zA-Z.-]+@[^@]+(\/[^\/]+)*$/,
  },

  async versions(moduleName) {
    return await npm.versions(moduleName)
  },

  async repositoryUrl(moduleName) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      return
    }

    const { repository } = await res.json() as { repository: { url: string } }

    return repository.url.replace('.git', '').replace('git+', '')
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl

    const arr = pathname.split('/')

    const moduleName = arr[1].startsWith('@')
      ? `${arr[1]}/${arr[2].split('@')[0]}`
      : arr[1].split('@')[0]

    const version = arr[1].startsWith('@')
      ? arr[2].split('@')[1]
      : arr[1].split('@')[1]

    return {
      moduleName,
      version,
    }
  },
})
