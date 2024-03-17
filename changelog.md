## Upcoming

- **Regenerate `deno.lock`.** If your project has a `deno.lock` file, updater will now regenerate this file as well.

- **Update side effect imports.** updater used to ignore such imports in the past due to a minor bug that occurred during the parsing of the regex matches. This issue has now been resolved.
  
  [mdn reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#import_a_module_for_its_side_effects_only)

- **Support for denopkg.com.** updater can now update `https://denopkg.com/...` imports.

## [v0.17.0](https://github.com/boywithkeyboard/updater/releases/tag/v0.17.0)

- **Compatibility Checking**

  updater now performs a basic compatibility check (with `deno check`) and adds a warning to the changelog if there are any issues.

## [v0.16.0](https://github.com/boywithkeyboard/updater/releases/tag/v0.16.0)

- **Support for JSR**

  updater can now handle `jsr:` imports. Please read [the documentation](https://github.com/boywithkeyboard/updater#supported-registries) to learn more.

- **Bug Fixes**

  - Scoped NPM modules should now be updated correctly.
  - In the event of an error, response body streams are now properly aborted.

## [v0.15.0](https://github.com/boywithkeyboard/updater/releases/tag/v0.15.0)

- **GitHub Action**

  It's now easier than ever to integrate **boywithkeyboard's updater** into your workflow.

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
