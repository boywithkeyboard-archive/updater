import { jsonc } from 'jsonc'
import { gray, green, strikethrough, white } from 'std/fmt/colors.ts'
import { walk } from 'std/fs/walk.ts'
import { checkImport, CheckResult } from './check_import.ts'

const REGEX =
  /(?:(?<=(?:import|export)[^`'"]*from\s+[`'"])(?<path1>[^`'"]+)(?=(?:'|"|`)))|(?:\b(?:import|export)(?:\s+|\s*\(\s*)[`'"](?<path2>[^`'"]+)[`'"])/g

type UpdateResult = CheckResult & {
  filePath: string
}

export async function update(input: string[], options: {
  allowBreaking?: boolean
  allowUnstable?: boolean
  logging?: boolean
  readOnly?: boolean
} = {}) {
  let changes: UpdateResult[] = []

  for (const i of input) {
    try {
      const { isFile, isDirectory } = await Deno.stat(i)

      if (isFile) {
        const c = await updateFile(i, options)

        changes = [...changes, ...c]
      } else if (isDirectory) {
        for await (
          const entry of walk(i, {
            skip: [/^\.git.*$/, /^\.vscode.*$/],
            followSymlinks: false,
            exts: ['js', 'ts', 'mjs', 'md', 'mdx', 'jsonc', 'json'],
          })
        ) {
          const c = await updateFile(entry.path, options)

          changes = [...changes, ...c]
        }
      }
    } catch (_) {}
  }

  return changes
}

async function updateFile(path: string, {
  allowBreaking = false,
  allowUnstable = false,
  logging = false,
  readOnly = false,
}: {
  allowBreaking?: boolean
  allowUnstable?: boolean
  logging?: boolean
  readOnly?: boolean
} = {}): Promise<UpdateResult[]> {
  try {
    let content = await Deno.readTextFile(path)
    const results: CheckResult[] = []

    if (path.endsWith('/deno.json')) {
      const json = JSON.parse(content) as { imports?: Record<string, string> }

      if (!json.imports) {
        return []
      }

      for (const key in json.imports) {
        const result = await checkImport(json.imports[key], {
          allowBreaking,
          allowUnstable,
        })

        if (result) {
          results.push(result)
        }

        json.imports[key] = result === null
          ? json.imports[key]
          : json.imports[key].replace(
            `@${result.oldVersion}`,
            `@${result.newVersion}`,
          )
      }
    } else if (path.endsWith('/deno.jsonc')) {
      const json = jsonc.parse(content) as { imports?: Record<string, string> }

      if (!json.imports) {
        return []
      }

      for (const key in json.imports) {
        const result = await checkImport(json.imports[key], {
          allowBreaking,
          allowUnstable,
        })

        if (result) {
          results.push(result)
        }

        json.imports[key] = result === null
          ? json.imports[key]
          : json.imports[key].replace(
            `@${result.oldVersion}`,
            `@${result.newVersion}`,
          )
      }
    } else {
      const identifiers: Record<string, string> = {}

      for (const match of content.matchAll(REGEX)) {
        const result = await checkImport(match[0], {
          allowBreaking,
          allowUnstable,
        })

        if (result) {
          results.push(result)
        }

        identifiers[match[0]] = result === null
          ? match[0] as string
          : (match[0] as string).replace(
            `@${result.oldVersion}`,
            `@${result.newVersion}`,
          )
      }

      content = content.replace(REGEX, (_, identifier) => {
        return identifiers[identifier]
      })
    }

    if (!readOnly) {
      await Deno.writeTextFile(path, content)
    }

    if (logging) {
      for (const result of results) {
        logResult(result)
      }
    }

    return results.map((result) => {
      // @ts-ignore:
      result.filePath = path

      return result
    }) as UpdateResult[]
  } catch (_) {
    return []
  }
}

function logResult(result: CheckResult) {
  console.info(
    gray(
      `${white(result.moduleName)} × ${strikethrough(result.oldVersion)} → ${
        green(result.newVersion)
      }`,
    ),
  )
}
