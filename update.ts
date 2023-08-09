import * as semver from 'https://deno.land/std@0.190.0/semver/mod.ts#pin'
import {
  brightGreen,
  gray,
  strikethrough,
  white,
} from 'https://deno.land/std@0.197.0/fmt/colors.ts'
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

  for (const file of files) {
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

        const { moduleName, version } = data

        if (!semver.valid(version)) {
          continue
        }

        let versions = await registry.fetchReleases(moduleName) as string[]

        if (!versions) {
          continue
        }

        versions = versions.sort(semver.rcompare)

        const difference = semver.difference(
          version,
          versions[0],
        )

        if (
          difference === null || // same version
          !allowBreaking && difference === 'major' || // breaking
          !allowUnstable && difference === 'prerelease' // unstable
        ) {
          continue
        }

        if (
          updates[registry.registryName as keyof typeof updates][moduleName]
        ) {
          updates[registry.registryName as keyof typeof updates][moduleName]
            .push(
              [version, versions[0]],
            )
        } else {
          updates[registry.registryName as keyof typeof updates][moduleName] = [
            [
              version,
              versions[0],
            ],
          ]
        }
      } catch (_err) {
        continue
      }
    }
  }

  let changelog = ''

  for (const [registry, deps] of Object.entries(updates)) {
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
      changelog += `  - ${name} × \`${from}\` → \`${to}\`${
        count > 1 ? ` (x${count})` : ''
      }\n`

      console.log(
        gray(
          `${white(name)} × ${strikethrough(from)} → ${brightGreen(from)}`,
        ),
      )
    }
  }

  if (createChangelog) {
    await Deno.writeTextFile('./update_changelog.md', changelog)
  }

  return updates
}
