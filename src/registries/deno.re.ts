import { Registry } from '../registry'
import { raw_githubusercontent_com } from './raw.githubusercontent.com'

export const deno_re = new Registry({
  config: {
    name: 'deno.re',
    importType: 'url',
    regex:
      /^https:\/\/deno\.re\/(std|(([a-zA-Z0-9\-]+)\/([a-zA-Z0-9._\-]+)))@[a-zA-Z0-9.*]+(\/([a-zA-Z0-9._\-]+))*$/
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

    if (arr[1].split('@')[0] === 'std') {
      return {
        moduleName: 'denoland/deno_std',
        version: arr[1].split('@')[1]
      }
    } else {
      return {
        moduleName: arr[1] + '/' + arr[2].split('@')[0],
        version: arr[2].split('@')[1]
      }
    }
  }
})
