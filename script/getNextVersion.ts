import * as semver from 'semver'

export function getNextVersion(args: {
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
      ) ?? args.version
    }
  }

  // has no/invalid semver range

  const latestVersion = args.versions[args.versions.length - 1]

  const diff = semver.difference(args.version, latestVersion)

  if (semver.gte(args.version, latestVersion)) {
    return latestVersion
  }

  if (latestVersion === args.version || diff === null) {
    return latestVersion
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
