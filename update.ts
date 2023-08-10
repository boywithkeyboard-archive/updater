// Copyright 2023 Samuel Kopp. All rights reserved. MIT license.
import * as semver from 'https://deno.land/std@0.190.0/semver/mod.ts#pin'
import {
  brightGreen,
  gray,
  strikethrough,
  white,
} from 'https://deno.land/std@0.198.0/fmt/colors.ts'
import { Files } from './analyze.ts'
import { registries } from './registries.ts'

export async function update({
  allowBreaking = false,
  allowUnstable = false,
  createChangelog = false,
  files,
}: {
  allowBreaking?: boolean
  allowUnstable?: boolean
  createChangelog?: boolean
  files: Files
}) {
  const updates: {
    'esm.sh': Record<string, [string, string][]>
    'deno.land': Record<string, [string, string][]>
    'cdn.jsdelivr.net': Record<string, [string, string][]>
  } = {
    'esm.sh': {},
    'deno.land': {},
    'cdn.jsdelivr.net': {},
  }

  const cache = new Map<string, string[]>()

  for (const file of files) {
    const urls: [string, string][] = []

    for (const url of file.urls) {
      try {
        if (url.endsWith('#pin')) {
          continue
        }

        const registry = registries.filter((r) =>
          url.startsWith(r.urlPrefix)
        )[0]

        const data = registry.parseUrl(url)

        if (!data) {
          continue
        }

        const { moduleName, version: currentVersion } = data

        if (!semver.valid(currentVersion)) {
          continue
        }

        let versions = cache.get(registry.registryName + ':' + moduleName)

        if (!versions) {
          versions = await registry.fetchReleases(moduleName) as string[]
        }

        if (!versions) {
          continue
        }

        const nextVersion = getNextVersion({
          currentVersion,
          versions,
          allowBreaking,
          allowUnstable,
        })

        if (!nextVersion) {
          continue
        }

        if (
          updates[registry.registryName as keyof typeof updates][moduleName]
        ) {
          updates[registry.registryName as keyof typeof updates][moduleName]
            .push(
              [currentVersion, nextVersion],
            )
        } else {
          updates[registry.registryName as keyof typeof updates][moduleName] = [
            [
              currentVersion,
              nextVersion,
            ],
          ]
        }

        if (!cache.has(registry.registryName + ':' + moduleName)) {
          cache.set(registry.registryName + ':' + moduleName, versions)
        }

        urls.push([url, url.replace(currentVersion, nextVersion)])
      } catch (_err) {
        continue
      }
    }

    let content = await Deno.readTextFile(file.filePath)

    for (const [from, to] of urls) {
      content = content.replaceAll(from, to)
    }

    await Deno.writeTextFile(file.filePath, content)
  }

  let changelog = ''

  for (const [registry, deps] of Object.entries(updates)) {
    if (Object.keys(deps).length === 0) {
      continue
    }

    if (changelog === '') {
      changelog += `- **${registry}**\n\n`
    } else {
      changelog += `\n- **${registry}**\n\n`
    }

    const arr: { name: string; from: string; to: string; count: number }[] = []

    for (const [name, updates] of Object.entries(deps)) {
      for (const update of updates) {
        const i = arr.findIndex((i) =>
          i.name === name && i.from === update[0] && i.to === update[1]
        )

        if (i > -1) {
          arr[i].count++
        } else {
          arr.push({ name, from: update[0], to: update[1], count: 1 })
        }
      }
    }

    for (const { name, from, to, count } of arr) {
      let repoUrl

      try {
        const r = registries.filter((r) => registry === r.registryName)[0]

        repoUrl = await r.fetchRepositoryUrl(name)
      } catch (_err) {
        //
      }

      changelog += `  - ${
        repoUrl ? `[${name}](${repoUrl})` : name
      } × \`${from}\` → \`${label(from, to)}\`${
        count > 1 ? ` (x${count})` : ''
      }\n`

      console.log(
        gray(
          `${white(name)} × ${strikethrough(from)} → ${
            brightGreen(label(from, to))
          }`,
        ),
      )
    }
  }

  if (createChangelog) {
    await Deno.writeTextFile('./updates_changelog.md', changelog)
  }

  return updates
}

function label(currentVersion: string, nextVersion: string) {
  const diff = semver.difference(currentVersion, nextVersion)
  const version = semver.parse(nextVersion)

  if (!version) {
    return nextVersion
  }

  return diff?.startsWith('pre')
    ? `🚧 ${nextVersion}`
    : diff === 'major'
    ? `⚠️ ${nextVersion}`
    : version.major === 0
    ? `🤞 ${nextVersion}`
    : nextVersion
}

function getNextVersion(args: {
  currentVersion: string
  versions: string[]
  allowBreaking: boolean
  allowUnstable: boolean
}) {
  args.versions = args.versions.sort(semver.compare)

  const latestVersion = args.versions[args.versions.length - 1]

  const diff = semver.difference(args.currentVersion, latestVersion)

  if (semver.gte(args.currentVersion, latestVersion)) {
    return
  }

  if (latestVersion === args.currentVersion || diff === null) {
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
