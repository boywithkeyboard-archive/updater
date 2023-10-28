### Workflow

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

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Run update
        run: |
          deno run -A mod.ts -c
          CHANGELOG=$(cat updates_changelog.md)
          echo "CHANGELOG<<EOF" >> $GITHUB_ENV
          echo "$CHANGELOG" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV
          rm updates_changelog.md

      - name: Create pull request
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'refactor: update dependencies'
          author: 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>'
          committer: 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>'
          commit-message: 'refactor: update dependencies'
          body: '${{ env.CHANGELOG }}'
          labels: 'dependencies'
          delete-branch: true
          branch: 'refactor/dependencies'
```
