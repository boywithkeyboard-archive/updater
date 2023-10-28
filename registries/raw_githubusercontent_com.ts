import { Octokit } from 'octokit'
import { Registry } from '../script/registry.ts'

const gh = new Octokit()

export const raw_githubusercontent_com = new Registry({
  config: {
    name: 'raw.githubusercontent.com',
    importType: 'url',
    regex: /^https:\/\/raw\.githubusercontent\.com(\/[^\/]+){4,}$/,
  },

  async versions(moduleName) {
    const releases = await gh.paginate(gh.rest.repos.listReleases, {
      owner: moduleName.split('/')[0],
      repo: moduleName.split('/')[1],
    })

    if (releases.length > 0) {
      return releases.map((release) => release.tag_name)
    }

    const tags = await gh.paginate(gh.rest.repos.listTags, {
      owner: moduleName.split('/')[0],
      repo: moduleName.split('/')[1],
    })

    return tags.map((tag) => tag.name)
  },

  repositoryUrl(moduleName) {
    return `https://github.com/${moduleName}`
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl

    const arr = pathname.split('/')

    return {
      moduleName: `${arr[1]}/${arr[2]}`,
      version: arr[3],
    }
  },
})
