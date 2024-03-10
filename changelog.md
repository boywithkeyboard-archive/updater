## Upcoming

- **Safe Mode**  
  Compatibility checking through `deno check` and `deno lint` can now be enabled with the `--safe-mode` flag or the `safeMode` option.

## [v0.15.0](https://github.com/boywithkeyboard/updater/releases/tag/v0.15.0)

- **GitHub Action**  
  It's now easier than ever to integrate **boywithkeyboard's updater** in your workflow.

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

  [Read more](https://github.com/boywithkeyboard/updater#github-action)
