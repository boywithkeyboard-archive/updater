import { Registry } from '../types.ts'

export const esmdotsh: Registry = {
  registryName: 'esm.sh',
  urlPrefix: 'https://esm.sh/',

  async fetchReleases(moduleName) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      return
    }

    const json = await res.json() as { versions: string[] }

    return Object.keys(json.versions)
  },

  async fetchRepositoryUrl(moduleName) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`)

    if (!res.ok) {
      return
    }

    const json = await res.json() as { repository: { url: string } }

    return json.repository.url.replace('.git', '').replace('git+', '')
  },

  parseUrl(url) {
    url = url.replace('https://', '')

    let moduleName = url
      .split('/')[1]
      .split('@')[0]

    if (moduleName.length === 0) {
      moduleName = url.split('/')[1] + '/' + url.split('/')[2].split('@')[0]
    }

    const isScopedPackage = url.split('/')[1].split('@')[0].length === 0

    const version = isScopedPackage
      ? url.split('/')[2].split('@')[1]
      : url.split('/')[1].split('@')[1]

    return {
      moduleName,
      version,
    }
  },
}
