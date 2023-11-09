## boywithkeyboard's updater

> [!WARNING]
> This project is currently in public beta and is therefore not yet stable.

### CLI

> [!NOTE]  
> The entry point can be either a directory or file. You can also specify
> multiple files and/or directories.

```bash
deno run -Ar https://den.ooo/updater ./deno.json
```

#### Options:

- `--breaking` / `-b` : allow breaking updates (major releases)
- `--unstable` / `-u` : allow unstable updates (prereleases)
- `--changelog` / `-c` : create changelog (updates_changelog.md)
- `--dry-run` / `--readonly` : don't apply updates

### Symbols

- ⚠️ **breaking**\
  This update might break your code.
- 🚧 **unstable**\
  This is a prerelease and might therefore come with unwanted issues.
- 🤞 **early**\
  This module doesn't strictly adhere to semver yet, so this version might break
  your code.

### GitHub workflow

[View example](https://github.com/deaddeno/update/blob/dev/docs/workflow.md)

### Advanced usage

- #### Pin a dependency

  To ignore a particular import, you can append `#pin` to the url.

  ```ts
  import * as semver from 'https://deno.land/std@0.200.0/semver/mod.ts#pin'
  ```

- #### Specify a version range

  To override the default behavior, you can append a
  [SemVer range](https://github.com/deaddeno/update/blob/dev/docs/semver_ranges.md)
  to the url.

  ```ts
  import cheetah from 'https://deno.land/x/cheetah@v1.5.2/mod.ts#~v1.5'
  ```

### Supported registries

- [cdn.jsdelivr.net](https://jsdelivr.com)
- [den.ooo](https://den.ooo)
- [deno.land](https://deno.land)
- [esm.sh](https://esm.sh)
- [npm](https://npmjs.com)

  > [!IMPORTANT]  
  > npm imports are treated slightly different. If you want to pin a dependency,
  > you must specify an **exact version**, e.g. `npm:example@1.0.0`, and if you
  > want to make a dependency updatable, you must add a preceding `^`, e.g.
  > `npm:example@^1.0.0`.
- [raw.githubusercontent.com](https://raw.githubusercontent.com)
