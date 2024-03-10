### CLI

The entry point can be either a directory or file. You can also specify multiple files and/or directories.

```bash
deno run -Ar https://den.ooo/gh/boywithkeyboard/updater@v0.15.0/mod.ts ./deno.json
```

**Options:**

- `--breaking` / `-b` : allow breaking updates (major releases)
- `--unstable` / `-u` : allow unstable updates (prereleases)
- `--changelog` / `-c` : create changelog (updates_changelog.md)
- `--dry-run` / `--readonly` : don't apply updates
<!-- - `--safe-mode` / `-s` : perform compatibility checks -->

[View example](https://github.com/boywithkeyboard/updater/blob/main/docs/action.md)

### GitHub Workflow

[View example](https://github.com/boywithkeyboard/updater/blob/main/docs/workflow.md)
