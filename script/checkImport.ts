import * as semver from 'https://deno.land/std@0.190.0/semver/mod.ts#pin'
import { getNextVersion } from './getNextVersion.ts'
import { registries } from './registries.ts'

export type CheckResult = {
  import: string
  moduleName: string
  registryName: string
  repositoryUrl: string | null
  oldVersion: string
  newVersion: string
  versions: string[]
  type:
    | 'unstable'
    | 'breaking'
    | 'early'
    | null
}

const cache = new Map<{
  importSpecifier: string
  allowBreaking: boolean
  allowUnstable: boolean
}, CheckResult | null>()

// const cache = new LRUCache({
//   max: 500,
//   ttl: 30,
// })

/**
 * Specify a file or directory path to check every import in it for any available updates.
 *
 * @example
 *
 * ```ts
 * const result = await checkImport('npm:foo@1')
 * const result = await checkImport('https://den.ooo/updater@v1.0.0')
 * ```
 */
export async function checkImport(
  importSpecifier: string,
  {
    allowBreaking = false,
    allowUnstable = false,
    // logging = false,
  }: {
    allowBreaking?: boolean
    allowUnstable?: boolean
    // logging?: boolean
  } = {},
): Promise<CheckResult | null> {
  try {
    const cachedResult = cache.get({
      importSpecifier,
      allowBreaking,
      allowUnstable,
    })

    if (cachedResult !== undefined) {
      return cachedResult
    }

    const registry = registries.filter((r) =>
      r.config.regex.test(importSpecifier)
    )[0]

    if (!registry) {
      return null
    }

    const { moduleName, version } = registry.parseImport(
      // @ts-ignore:
      registry.config.importType === 'url'
        ? { importUrl: new URL(importSpecifier) }
        : { importString: importSpecifier },
    )

    let repositoryUrl: string | null = null

    try {
      repositoryUrl = await registry.repositoryUrl(moduleName) ?? null
      // deno-lint-ignore no-empty
    } catch (_) {}

    let newVersion = version

    let result: CheckResult

    if (
      importSpecifier.endsWith('#pin') ||
      registry.config.importType === 'string' && !version.startsWith('^')
    ) {
      result = {
        import: importSpecifier,
        moduleName,
        registryName: registry.config.name,
        repositoryUrl,
        oldVersion: version,
        newVersion,
        versions: [],
        type: null,
      }

      cache.set({
        importSpecifier,
        allowBreaking,
        allowUnstable,
      }, result)

      return result
    }

    const versions = (await registry.versions(moduleName)).filter((v) =>
      semver.valid(v) !== null
    )

    const nextVersion = getNextVersion({
      importSpecifier,
      version: version.replace('^', ''),
      versions,
      allowBreaking,
      allowUnstable,
    })

    newVersion = version.startsWith('^') ? `^${nextVersion}` : nextVersion

    result = {
      import: importSpecifier,
      moduleName,
      registryName: registry.config.name,
      repositoryUrl,
      oldVersion: version,
      newVersion,
      versions,
      type: label(version.replace('^', ''), newVersion.replace('^', '')),
    }

    cache.set({
      importSpecifier,
      allowBreaking,
      allowUnstable,
    }, result)

    return result
  } catch (_) {
    console.log(_)
    return null
  }
}

function label(oldVersion: string, newVersion: string): CheckResult['type'] {
  const diff = semver.difference(oldVersion, newVersion)
  const version = semver.parse(newVersion)

  if (!version) {
    return null
  }

  return diff?.startsWith('pre')
    ? 'unstable'
    : diff === 'major'
    ? 'breaking'
    : version.major === 0
    ? 'early'
    : null
}
