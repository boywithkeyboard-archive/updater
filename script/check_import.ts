import { LRUCache } from 'lru-cache'
import * as semver from 'semver'
import { registries } from './registries.ts'

export type CheckResult = {
  import: string
  moduleName: string
  registryName: string
  repositoryUrl: string
  oldVersion: string
  newVersion: string
  versions: string[]
  /**
   * 🚧 - e.g. 0.9.0 -> 1.0.0-beta.0 (might be **unstable**)
   * ⚠️ - e.g. 0.9.0 -> 1.0.0 (might be **breaking**)
   * 🤞 - e.g. 0.9.0 -> 0.10.0 (might be **unstable**)
   */
  type:
    | '🚧'
    | '⚠️'
    | '🤞'
    | null
}

const cache = new LRUCache({
  max: 500,
  ttl: 30,
  ttlAutopurge: true,
})

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
  }: {
    allowBreaking?: boolean
    allowUnstable?: boolean
  } = {},
): Promise<CheckResult | null> {
  try {
    const cachedResult = cache.get({
      importSpecifier,
      allowBreaking,
      allowUnstable,
    }) as CheckResult

    if (cachedResult) {
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

    const repositoryUrl = await registry.repositoryUrl(moduleName)

    if (!repositoryUrl) {
      throw new Error()
    }

    const versions = (await registry.versions(moduleName)).filter((v) =>
      semver.valid(v) !== null
    )

    let newVersion = version

    let result: CheckResult

    if (importSpecifier.endsWith('#pin')) {
      result = {
        import: importSpecifier,
        moduleName,
        registryName: registry.config.name,
        repositoryUrl,
        oldVersion: version,
        newVersion,
        versions,
        type: null,
      }

      cache.set({
        importSpecifier,
        allowBreaking,
        allowUnstable,
      }, result)

      return result
    }

    const nextVersion = getNextVersion({
      importSpecifier,
      version,
      versions,
      allowBreaking,
      allowUnstable,
    })

    if (!nextVersion) {
      throw new Error()
    }

    newVersion = nextVersion

    result = {
      import: importSpecifier,
      moduleName,
      registryName: registry.config.name,
      repositoryUrl,
      oldVersion: version,
      newVersion,
      versions,
      type: label(version, newVersion),
    }

    cache.set({
      importSpecifier,
      allowBreaking,
      allowUnstable,
    }, result)

    return result
  } catch (_) {
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
    ? '🚧'
    : diff === 'major'
    ? '⚠️'
    : version.major === 0
    ? '🤞'
    : null
}

function getNextVersion(args: {
  importSpecifier: string
  version: string
  versions: string[]
  allowBreaking: boolean
  allowUnstable: boolean
}) {
  args.versions = args.versions.sort(semver.compare)

  // has (valid) semver range

  if (args.importSpecifier.includes('#')) {
    const range = semver.validRange(args.importSpecifier.split('#')[1])

    if (range !== null) {
      return semver.maxSatisfying(
        args.versions,
        args.importSpecifier.split('#')[1],
      ) ??
        undefined
    }
  }

  // has no/invalid semver range

  const latestVersion = args.versions[args.versions.length - 1]

  const diff = semver.difference(args.version, latestVersion)

  if (semver.gte(args.version, latestVersion)) {
    return
  }

  if (latestVersion === args.version || diff === null) {
    return
  }

  if (
    (args.allowBreaking || args.allowUnstable) && diff === 'major' || // breaking
    args.allowUnstable && diff.startsWith('pre') || // unstable
    diff === 'minor' || diff === 'patch'
  ) {
    return latestVersion
  }

  args.versions.pop()

  return getNextVersion(args)
}
