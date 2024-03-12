import { Registry } from '../script/registry.ts'
import { npm } from './npm.ts'
import { raw_githubusercontent_com } from './raw_githubusercontent_com.ts'

export const cdn_jsdelivr_net = new Registry({
  config: {
    name: 'cdn.jsdelivr.net',
    importType: 'url',
    regex:
      /^https:\/\/cdn\.jsdelivr\.net\/((gh(\/[^\/]+){2}@[^\/]+(\/[^\/]+)+)|(npm\/((@([0-9a-zA-Z.-]+)\/)?)[0-9a-zA-Z.-]+@[^@]+(\/[^\/]+)+))$/,
  },

  async versions(moduleName) {
    // github repository
    if (moduleName.includes('/') && !moduleName.startsWith('@')) {
      return await raw_githubusercontent_com.versions(moduleName)
      // npm package
    } else {
      return await npm.versions(moduleName)
    }
  },

  async repositoryUrl(moduleName) {
    // github repository
    if (moduleName.includes('/') && !moduleName.startsWith('@')) {
      return `https://github.com/${moduleName}`
    }

    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      await res.body?.cancel()

      return
    }

    const json = await res.json() as { repository: { url: string } }

    return json.repository.url.replace('.git', '').replace('git+', '')
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl
    const arr = pathname.split('/')

    // github repository
    if (pathname.startsWith('/gh')) {
      return {
        moduleName: arr[2] + '/' +
          arr[3].split('@')[0],
        version: arr[3].split('@')[1],
      }
      // npm package
    } else {
      let moduleName = pathname
        .split('/')[2]
        .split('@')[0]

      let version = arr[2].split('@')[1]

      if (moduleName.length === 0) {
        moduleName = arr[2] + '/' +
          arr[3].split('@')[0]
        version = arr[3].split('@')[1]
      }

      return {
        moduleName,
        version,
      }
    }
  },
})
