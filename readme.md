<div align='center'>
  <h1>boywithkeyboard's updater</h1>
</div>

![Demo](https://raw.githubusercontent.com/boywithkeyboard/updater/main/.github/showcase.png)

## Usage

The script is available as a
[GitHub Action](https://docs.github.com/en/actions/learn-github-actions) for
easy integration into your workflow.

> [!IMPORTANT]\
> Please make sure that you have enabled the **Allow GitHub actions to create
> and approve pull requests** setting, as shown
> [here](https://github.com/boywithkeyboard/updater/blob/main/.github/workflow_permission.png).

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

If you prefer to use this tool in another way, please read our
[alternative uses](https://github.com/boywithkeyboard/updater/blob/main/docs/alternative_uses.md).

## Configuration File

The file must be named `updater.json` and be located either in the root
directory of your project or in the `.github` directory.

```json
{
  "$schema": "https://updater.mod.land/schema.json"
}
```

- `include` (string or array of strings)

  The files, directories and glob patterns to be included for updates.

- `exclude` (string or array of strings)

  The files, directories and global patterns to exclude from updates. The
  `exclude` option comes **after** `include` and overwrites the specified
  patterns.

- `allowBreaking` (boolean)

  Allow breaking updates (major releases).

  _`false` by default_

- `allowUnstable` (boolean)

  Allow unstable updates (prereleases).

  _`false` by default_

- `readOnly` (boolean)

  Perform a dry run.

  _`false` by default_

## Stages

- **⚠️ breaking**

  _"This update might break your code."_

- **🚧 unstable**

  _"This is a prerelease and might therefore come with unwanted issues."_

- **🤞 early**

  _"This module doesn't strictly adhere to semver yet, so this version might
  break your code."_

## Advanced Usage

- **Pin a dependency**

  To ignore a particular import, you can append `#pin` to the url.

  ```ts
  import * as semver from 'https://deno.land/std@0.200.0/semver/mod.ts#pin'
  ```

- **Specify a version range**

  To override the default behavior, you can append a
  [SemVer range](https://github.com/deaddeno/update/blob/dev/docs/semver_ranges.md)
  to the url.

  ```ts
  import cheetah from 'https://deno.land/x/cheetah@v1.5.2/mod.ts#~v1.5'
  ```

## Supported Registries

- [cdn.jsdelivr.net](https://jsdelivr.com)

- [den.ooo](https://den.ooo)

- [deno.land](https://deno.land)

- [denopkg.com](https://denopkg.com)

- [esm.sh](https://esm.sh)

- [jsr](https://jsr.io)

  `jsr:` imports are treated slightly different. If you want to pin a
  dependency, you must specify an **exact version**, e.g. `jsr:example@1.0.0`,
  and if you want to make a dependency updatable, you must add a preceding `^`,
  e.g. `jsr:example@^1.0.0`.

- [npm](https://npmjs.com)

  `npm:` imports are treated the same as `jsr:` imports.

- [raw.githubusercontent.com](https://raw.githubusercontent.com)

<!-- - [x.nest.land](https://nest.land) -->
