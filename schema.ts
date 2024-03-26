import { Type } from 'typebox'

export const schema = Type.Object({
  $schema: Type.Optional(
    Type.String(),
  ),
  include: Type.Optional(
    Type.Union([
      Type.Array(
        Type.String(),
      ),
      Type.String(),
    ], {
      description:
        'The files, directories and glob patterns to be included for updates.',
    }),
  ),
  exclude: Type.Optional(
    Type.Union([
      Type.Array(
        Type.String(),
      ),
      Type.String(),
    ], {
      description:
        'The files, directories and global patterns to exclude from updates.',
    }),
  ),
  allowBreaking: Type.Optional(
    Type.Boolean({
      description: 'Allow breaking updates (major releases).',
      default: false,
    }),
  ),
  allowUnstable: Type.Optional(
    Type.Boolean({
      description: 'Allow unstable updates (prereleases).',
      default: false,
    }),
  ),
  readOnly: Type.Optional(
    Type.Boolean({
      description: 'Perform a dry run.',
      default: false,
    }),
  ),
}, {
  additionalProperties: false,
})

if (import.meta.main) {
  Deno.writeTextFile('schema.json', JSON.stringify(schema, null, 2))
}
