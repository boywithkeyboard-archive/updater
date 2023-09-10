import { Registry } from '../types.ts'

export const jsdelivrdotnet: Registry = {
  registryName: 'cdn.jsdelivr.net',
  urlPrefix: 'https://cdn.jsdelivr.net/',

  async fetchReleases(moduleName) {
    if (moduleName.includes('/') && !moduleName.startsWith('@')) { // github repository
      const res = await fetch(
        `https://api.github.com/repos/${moduleName}/releases`,
      )

      if (!res.ok) {
        return
      }

      const json = await res.json() as { tag_name: string }[]

      return json.map((release) => release.tag_name)
    } else { // npm package
      const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

      if (!res.ok) {
        return
      }

      const json = await res.json() as { versions: Record<string, unknown> }

      return Object.keys(json.versions)
    }
  },

  async fetchRepositoryUrl(moduleName) {
    if (moduleName.includes('/') && !moduleName.startsWith('@')) { // github repository
      return `https://github.com/${moduleName}`
    }

    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      return
    }

    const json = await res.json() as { repository: { url: string } }

    return json.repository.url.replace('.git', '').replace('git+', '')
  },

  parseUrl(url) {
    url = url.replace('https://', '')

    if (url.startsWith('https://cdn.jsdelivr.net/gh/')) { // github repository
      return {
        moduleName: url.split('/')[2] + '/' + url.split('/')[3].split('@')[0],
        version: url.split('/')[3].split('@')[1],
      }
    } else { // npm package
      let moduleName = url
        .split('/')[2]
        .split('@')[0]

      let version = url.split('/')[2].split('@')[1]

      if (moduleName.length === 0) {
        moduleName = url.split('/')[2] + '/' + url.split('/')[3].split('@')[0]
        version = url.split('/')[3].split('@')[1]
      }

      return {
        moduleName,
        version,
      }
    }
  },
}
