import { Registry } from '../script/registry.ts'
import { raw_githubusercontent_com } from './raw.githubusercontent.com.ts'

export const denopkg_com = new Registry({
  config: {
    name: 'denopkg.com',
    importType: 'url',
    regex: /^https:\/\/denopkg\.com(\/[^\/]+){2}@[^\/@]+(\/[^\/]+)+$/,
  },

  versions(moduleName) {
    return raw_githubusercontent_com.versions(moduleName)
  },

  repositoryUrl(moduleName) {
    return `https://github.com/${moduleName}`
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl

    const arr = pathname.split('/')

    return {
      moduleName: arr[1] + '/' + arr[2].split('@')[0],
      version: arr[2].split('@')[1],
    }
  },
})
