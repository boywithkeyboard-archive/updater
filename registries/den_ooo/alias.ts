import { Registry } from '../../script/registry.ts'
import { den_ooo_gh } from './gh.ts'
import { den_ooo_gl } from './gl.ts'

let aliases: Record<string, string | undefined>

async function fetchAliases() {
  const res = await fetch(
    'https://raw.githubusercontent.com/dendotooo/aliases/main/aliases.json',
  )

  return await res.json()
}

export const den_ooo_alias = new Registry({
  config: {
    name: 'den.ooo',
    importType: 'url',
    regex: /^https:\/\/den\.ooo\/[^\/]+@[^\/]+(\/[^\/]+)*$/,
  },

  async versions(moduleName) {
    aliases ??= await fetchAliases()

    const realName = aliases[moduleName]

    if (!realName) {
      throw new Error()
    }

    if (realName.startsWith('gh/')) {
      return await den_ooo_gh.versions(moduleName)
    } else if (realName.startsWith('gl/')) {
      return await den_ooo_gl.versions(moduleName)
    } else {
      throw new Error()
    }
  },

  async repositoryUrl(moduleName) {
    aliases ??= await fetchAliases()

    const realName = aliases[moduleName]

    if (!realName) {
      throw new Error()
    }

    if (realName.startsWith('gh/')) {
      return den_ooo_gh.repositoryUrl(realName)
    } else if (realName.startsWith('gl/')) {
      return den_ooo_gl.repositoryUrl(realName)
    } else {
      throw new Error()
    }
  },

  parseImport({ importUrl }) {
    const { pathname } = importUrl
    const arr = pathname.split('/')

    return {
      moduleName: arr[1].split('@')[0],
      version: arr[1].split('@')[1],
    }
  },
})
