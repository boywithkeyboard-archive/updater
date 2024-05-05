import { getOctokit } from '@actions/github'
import { config } from '../config'
import { Registry } from '../registry'

const octokit = getOctokit(config().token)

export const raw_githubusercontent_com = new Registry({
  config: {
    name: 'raw.githubusercontent.com',
    importType: 'url',
    regex: /^https:\/\/raw\.githubusercontent\.com\/([^\/]+(\/)?){3,}$/
  },

  async versions(moduleName) {
    const releases = await octokit.paginate(octokit.rest.repos.listReleases, {
      owner: moduleName.split('/')[0],
      repo: moduleName.split('/')[1]
    })

    if (releases.length > 0) {
      return releases.map(r => r.tag_name)
    }

    const tags = await octokit.paginate(octokit.rest.repos.listTags, {
      owner: moduleName.split('/')[0],
      repo: moduleName.split('/')[1]
    })

    return tags.map(t => t.name)
  },

  repositoryUrl(moduleName) {
    return `https://github.com/${moduleName}`
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl

    const arr = pathname.split('/')

    return {
      moduleName: `${arr[1]}/${arr[2]}`,
      version: arr[3]
    }
  }
})
