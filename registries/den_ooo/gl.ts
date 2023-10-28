import { Gitlab } from 'gitbeaker'
import { Registry } from '../../script/registry.ts'

const gl = new Gitlab({
  token: '', // just for the sdk to work
})

export const den_ooo_gl = new Registry({
  config: {
    name: 'den.ooo',
    importType: 'url',
    regex: /^https:\/\/den\.ooo\/gl\/[^\/]+\/[^\/]+@[^\/]+.*$/,
  },

  async versions(moduleName) {
    moduleName = moduleName.replace('gl/', '')

    const releases = await gl.ProjectReleases.all(moduleName, {
      maxPages: 5,
    })

    if (releases.length > 0) {
      return releases.map((release) => release.tag_name)
    }

    const tags = await gl.Tags.all(moduleName)

    return tags.map((tag) => tag.name)
  },

  repositoryUrl(moduleName) {
    return `https://gitlab.com/${moduleName.replace('gl/', '')}`
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
