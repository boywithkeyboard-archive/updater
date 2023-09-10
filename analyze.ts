import { walk } from 'https://deno.land/std@0.201.0/fs/walk.ts'
import { registries } from './registries.ts'

export type Files = {
  filePath: string
  urls: string[]
}[]

export async function analyze(
  ...paths: string[]
): Promise<Files> {
  const data: Files = []

  for (const path of paths) {
    try {
      const { isFile, isDirectory } = await Deno.stat(path)

      if (isFile) {
        const urls = await analyzeFile(path)

        if (!urls) {
          continue
        }

        data.push({
          filePath: path,
          urls,
        })
      } else if (isDirectory) {
        for await (const entry of walk(path)) {
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
  if (
    path.endsWith('deno.lock') ||
    path.includes('.github/workflows/') &&
      (path.endsWith('.yml') || path.endsWith('.yaml'))
  ) {
    return
  }

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

    if (filteredUrls.length === 0) {
      return
    }

    return filteredUrls
  } catch (_err) {
    return
  }
}
