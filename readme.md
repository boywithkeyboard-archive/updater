## deaddeno/update

### CLI

> **Note** The entry point can be either a directory or file. You can also
> specify multiple files and/or directories.

```bash
deno run -Ar https://deno.land/x/update/mod.ts ./deno.json
```

#### Options:

- `--breaking` / `-b` : allow breaking updates (major releases)
- `--unstable` / `-u` : allow unstable updates (prereleases)
- `--changelog` / `-c` : create changelog (update_changelog.md)

### Workflow

```yml
name: check

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Run update
        run: |
          deno run -Ar https://deno.land/x/update/mod.ts
          CHANGELOG=$(cat updates_changelog.md)
          echo "CHANGELOG<<EOF" >> $GITHUB_ENV
          echo "$CHANGELOG" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV
          rm updates_changelog.md

      - name: Create pull request
        uses: peter-evans/create-pull-request@v4
        with:
          assignees: '${{ inputs.assignees }}'
          reviewers: '${{ inputs.reviewers }}'
          token: '${{ secrets.token }}'
          title: 'refactor: update deps'
          author: 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>'
          committer: 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>'
          commit-message: 'refactor: update deps'
          body: '${{ env.CHANGELOG }}'
          labels: 'deps'
          delete-branch: true
          branch: 'refactor/deps'
```
