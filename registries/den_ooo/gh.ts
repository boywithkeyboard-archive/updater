import { Registry } from '../../script/registry.ts'
import { raw_githubusercontent_com } from '../raw_githubusercontent_com.ts'

export const den_ooo_gh = new Registry({
  config: {
    name: 'den.ooo',
    importType: 'url',
    regex: /^https:\/\/den\.ooo\/gh\/[^\/]+\/[^\/]+@[^\/]+.*$/,
  },

  versions(moduleName) {
    moduleName = moduleName.replace('gh/', '')

    return raw_githubusercontent_com.versions(moduleName)
  },

  repositoryUrl(moduleName) {
    return `https://github.com/${moduleName.replace('gh/', '')}`
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl

    const arr = pathname.split('/').slice(1, 4)

    const moduleName = arr.map((str, i) => {
      if (i !== 2) {
        return str
      }

      return str.split('@')[0]
    }).join('/')

    return {
      moduleName,
      version: arr[2].split('@')[1],
    }
  },
})
