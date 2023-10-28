import { Registry } from '../../script/registry.ts'
import { den_ooo_gh } from './gh.ts'
import { den_ooo_gl } from './gl.ts'

const aliases: Record<string, string | undefined> = await fetchAliases()

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
    regex: /^https:\/\/den\.ooo\/[^\/]+@[^\/]+.*$/,
  },

  async versions(moduleName) {
    const name = aliases[moduleName]

    if (!name) {
      throw new Error()
    }

    if (name.startsWith('gh/')) {
      return await den_ooo_gh.versions(name)
    } else {
      return await den_ooo_gl.versions(name)
    }
  },

  repositoryUrl(moduleName) {
    const name = aliases[moduleName]

    if (!name) {
      throw new Error()
    }

    if (name.startsWith('gh/')) {
      return den_ooo_gh.repositoryUrl(name)
    } else {
      return den_ooo_gl.repositoryUrl(name)
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
