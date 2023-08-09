import { walk } from 'https://deno.land/std@0.197.0/fs/walk.ts'
import { registries } from './registries.ts'

export type Files = {
  filePath: string
  urls: string[]
}[]

export async function analyze(
  ...path: string[]
): Promise<Files> {
  const data: Files = []

  for (const p of path) {
    try {
      const { isFile, isDirectory } = await Deno.stat(p)

      if (isFile) {
        const urls = await analyzeFile(p)

        if (!urls) {
          continue
        }

        data.push({
          filePath: p,
          urls,
        })
      } else if (isDirectory) {
        for await (const entry of walk(p)) {
          const urls = await analyzeFile(entry.path)

          if (!urls) {
            continue
          }

          data.push({
            filePath: entry.path,
            urls,
          })
        }
      }
    } catch (_err) {
      continue
    }
  }

  return data
}

async function analyzeFile(path: string) {
  const urlRegex =
    /(?:(?:(?:[a-z]+:)?\/\/)|www\.)(?:\S+(?::\S*)?@)?(?:localhost|(?:(?:[a-z\u00a1-\uffff0-9][-_]*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#][^\s"]*)?/gi

  try {
    const content = await Deno.readTextFile(path)

    const urls = content.match(urlRegex)

    if (!urls) {
      return
    }

    const filteredUrls: string[] = []

    for (let url of urls) {
      url = url.replaceAll('\'', '').replaceAll('"', '').replace(')', '')

      if (registries.some((r) => url === r.urlPrefix)) {
        continue
      }

      const registry = registries.filter((r) => url.startsWith(r.urlPrefix))[0]

      if (
        url.includes('${') ||
        !registry
      ) {
        continue
      }

      filteredUrls.push(url)
    }

    if (filteredUrls.length === 0)
      return

    return filteredUrls
  } catch (_err) {
    return
  }
}
