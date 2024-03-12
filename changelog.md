## Upcoming

- ### Support for `deno.lock`

  If your project has a `deno.lock` file, the script will now attempt to update
  this file as well.

- ### Safe Mode

  You can now enable **compatibility checking** (with `deno check` and
  `deno lint`) through the `--safe-mode` flag or the `safeMode` option.

## [v0.16.0](https://github.com/boywithkeyboard/updater/releases/tag/v0.16.0)

- ### Support for JSR

  updater can now handle `jsr:` imports. Please read
  [the documentation](https://github.com/boywithkeyboard/updater#supported-registries)
  to learn more.

- ### Bug Fixes

  - Scoped NPM modules should now be updated correctly.
  - In the event of an error, response body streams are now properly aborted.

## [v0.15.0](https://github.com/boywithkeyboard/updater/releases/tag/v0.15.0)

- ### GitHub Action

  It's now easier than ever to integrate **boywithkeyboard's updater** into your
  workflow.

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
  ```

  [Read more](https://github.com/boywithkeyboard/updater?tab=readme-ov-file#boywithkeyboards-updater)
