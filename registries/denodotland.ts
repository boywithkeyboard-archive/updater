import { Registry } from '../types.ts'

export const denodotland: Registry = {
  registryName: 'deno.land',
  urlPrefix: 'https://deno.land/',

  async fetchReleases(moduleName) {
    const res = await fetch(
      `https://apiland.deno.dev/v2/modules/${moduleName}`,
    )

    if (!res.ok) {
      return
    }

    const json = await res.json() as { versions: string[] }

    return json.versions
  },

  async fetchRepositoryUrl(moduleName) {
    if (moduleName === 'std') {
      return 'https://github.com/denoland/deno_std'
    }

    const res = await fetch(
      `https://apiland.deno.dev/v2/metrics/modules/${moduleName}`,
    )

    if (!res.ok) {
      return
    }

    const json = await res.json() as {
      info: { upload_options: { repository: string } }
    }

    return `https://github.com/${json.info.upload_options.repository}`
  },

  parseUrl(url) {
    url = url.replace('https://', '')

    return {
      moduleName: url.startsWith('deno.land/std')
        ? 'std'
        : url.split('/')[2].split('@')[0],
      version: url.startsWith('deno.land/std')
        ? url.split('/')[1].split('@')[1]
        : url.split('/')[2].split('@')[1],
    }
  },
}
