import { Registry } from '../registry.ts'

export const deno_land = new Registry({
  config: {
    name: 'deno.land',
    importType: 'url',
    regex: /^https:\/\/deno\.land\/(x|std)\/.*(\.ts|\.js|\.json|\.mjs|\.wasm)$/,
  },

  async versions(moduleName) {
    const res = await fetch(
      `https://apiland.deno.dev/v2/modules/${moduleName}`,
    )

    if (!res.ok) {
      return []
    }

    const { versions } = await res.json() as { versions: string[] }

    return versions
  },

  async repositoryUrl({ moduleName }) {
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

  parseImport({ importUrl }) {
    const { pathname } = importUrl

    return {
      moduleName: pathname.startsWith('/std')
        ? 'std'
        : pathname.split('/')[2].split('@')[0],
      version: pathname.startsWith('/std')
        ? pathname.split('/')[1].split('@')[1]
        : pathname.split('/')[2].split('@')[1],
    }
  },
})
