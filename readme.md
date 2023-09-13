## deaddeno/update

### CLI

> **Note**\
> The entry point can be either a directory or file. You can also specify
> multiple files and/or directories.

```bash
deno run -Ar https://deno.land/x/update/mod.ts ./deno.json
```

#### Options:

- `--breaking` / `-b` : allow breaking updates (major releases)
- `--unstable` / `-u` : allow unstable updates (prereleases)
- `--changelog` / `-c` : create changelog (updates_changelog.md)
- `--dry-run` / `--readonly` : don't apply updates

### Symbols

- ⚠️ **breaking**
  \
  This update might break your code.
- 🚧 **unstable**
  \
  This is a prerelease and might therefore come with unwanted issues.
- 🤞 **early**
  \
  This module doesn't strictly adhere to semver yet, so this version might break
  your code.

### Workflow

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
  import cheetah from 'https://deno.land/x/cheetah@v1.5.0/mod.ts#~v1.5'
  ```
