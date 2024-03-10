## boywithkeyboard's updater

### Usage

The script is available as a [GitHub Action](https://docs.github.com/en/actions/learn-github-actions) for easy integration into your workflow.

```yml
name: update

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run updater
        uses: boywithkeyboard/updater@v0
      #  with:
      #    allowBreaking: true
```

#### Options:

- `commitMessage` - Commit message and title for the pull request.
- `allowBreaking` - Allow breaking updates (major releases).
- `allowUnstable` - Allow unstable updates (prereleases).
<!-- - `safeMode` : perform compatibility checks -->

If you prefer to use this tool in another way, please read our [alternative uses](https://github.com/boywithkeyboard/updater/blob/main/docs/alternative_uses.md).

### Stages

- **⚠️ breaking**

  *"This update might break your code."*

- **🚧 unstable**

  *"This is a prerelease and might therefore come with unwanted issues."*

- **🤞 early**

  *"This module doesn't strictly adhere to semver yet, so this version might break your code."*

### Advanced Usage

- **Pin a dependency**

  To ignore a particular import, you can append `#pin` to the url.

  ```ts
  import * as semver from 'https://deno.land/std@0.200.0/semver/mod.ts#pin'
  ```

- **Specify a version range**

  To override the default behavior, you can append a [SemVer range](https://github.com/deaddeno/update/blob/dev/docs/semver_ranges.md) to the url.

  ```ts
  import cheetah from 'https://deno.land/x/cheetah@v1.5.2/mod.ts#~v1.5'
  ```

### Supported Registries

- [cdn.jsdelivr.net](https://jsdelivr.com)

- [den.ooo](https://den.ooo)

- [deno.land](https://deno.land)

- [esm.sh](https://esm.sh)

- [npm](https://npmjs.com)

  npm imports are treated slightly different. If you want to pin a dependency, you must specify an **exact version**, e.g. `npm:example@1.0.0`, and if you want to make a dependency updatable, you must add a preceding `^`, e.g. `npm:example@^1.0.0`.

- [raw.githubusercontent.com](https://raw.githubusercontent.com)

- [jsr](https://jsr.io) *(coming soon)*
