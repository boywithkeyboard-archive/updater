import slash from 'slash'
import { gray, green, strikethrough, white } from 'std/fmt/colors.ts'
import { walk } from 'std/fs/walk.ts'
import { checkImport, CheckResult } from './checkImport.ts'

const REGEX =
  /(?:(?<=(?:import|export)[^`'"]*from\s+[`'"])(?<path1>[^`'"]+)(?=(?:'|"|`)))|(?:\b(?:import|export)(?:\s+|\s*\(\s*)[`'"](?<path2>[^`'"]+)[`'"])/g

const SIDE_EFFECT_IMPORTS_REGEX = /import (('([^']+)')|("([^"]+)"))/g

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
  let filesChecked = 0

  for (const i of input) {
    try {
      const { isFile, isDirectory } = await Deno.stat(i)

      if (isFile) {
        filesChecked++

        const c = await updateFile(i, options)

        changes = [...changes, ...c]
      } else if (isDirectory) {
        for await (
          const entry of walk(i, {
            skip: [/^\.git.*$/, /^\.vscode.*$/],
            followSymlinks: false,
            exts: ['.js', '.ts', '.mjs', '.md', '.mdx', '.json'],
          })
        ) {
          filesChecked++

          const c = await updateFile(entry.path, options)

          changes = [...changes, ...c]
        }
      }
      // deno-lint-ignore no-empty
    } catch (_) {}
  }

  return {
    filesChecked,
    changes: changes.filter((c) => c.oldVersion !== c.newVersion),
  }
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
  const normalizedPath = slash(path)

  try {
    let content = await Deno.readTextFile(path)
    const results: CheckResult[] = []

    if (normalizedPath.endsWith('/deno.json')) {
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

      content = content.endsWith('\n')
        ? JSON.stringify(json, null, 2) + '\n'
        : JSON.stringify(json, null, 2)
    } else {
      // update usual types of imports
      const identifiers: Record<string, string> = {}

      for (const match of content.matchAll(REGEX)) {
        const identifier = match[0]

        if (!identifier) {
          continue
        }

        const result = await checkImport(identifier, {
          allowBreaking,
          allowUnstable,
        })

        if (result) {
          results.push(result)
        }

        identifiers[identifier] = result === null
          ? identifier as string
          : (identifier as string).replace(
            `@${result.oldVersion}`,
            `@${result.newVersion}`,
          )
      }

      content = content.replace(REGEX, (_, identifier) => {
        return identifiers[identifier] ?? _
      })

      // update side effect imports
      const identifiers2: Record<string, string> = {}

      // single quote
      for (const match of content.matchAll(SIDE_EFFECT_IMPORTS_REGEX)) {
        const identifier = match[3]

        if (!identifier) {
          continue
        }

        const result = await checkImport(identifier, {
          allowBreaking,
          allowUnstable,
        })

        if (!result) {
          continue
        }

        results.push(result)

        identifiers2[identifier] = (identifier as string).replace(
          `@${result.oldVersion}`,
          `@${result.newVersion}`,
        )
      }

      // double quote
      for (const match of content.matchAll(SIDE_EFFECT_IMPORTS_REGEX)) {
        const identifier = match[5]

        if (!identifier) {
          continue
        }

        const result = await checkImport(identifier, {
          allowBreaking,
          allowUnstable,
        })

        if (!result) {
          continue
        }

        results.push(result)

        identifiers2[identifier] = (identifier as string).replace(
          `@${result.oldVersion}`,
          `@${result.newVersion}`,
        )
      }

      content = content.replace(SIDE_EFFECT_IMPORTS_REGEX, (...args) => {
        let str = args[0]

        for (const [key, value] of Object.entries(identifiers2)) {
          str = str.replace(key, value)
        }

        return str
      })
    }

    if (!readOnly) {
      await Deno.writeTextFile(path, content)
    }

    if (logging) {
      for (const result of results) {
        if (result.oldVersion !== result.newVersion) {
          logResult(result)
        }
      }
    }

    return results.map((result) => {
      // @ts-ignore:
      result.filePath = normalizedPath

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
