import { Type } from 'typebox'

export const schema = Type.Object({
  $schema: Type.Optional(
    Type.String(),
  ),
  // include: Type.Optional(
  //   Type.Array(
  //     Type.String()
  //   )
  // ),
  // exclude: Type.Optional(
  //   Type.Array(
  //     Type.String()
  //   )
  // ),
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
  // commitMessage: Type.Optional(
  //   Type.String({
  //     description: 'The commit message and the title for the pull request.',
  //     default: 'deno: update imports',
  //   }),
  // ),
  readOnly: Type.Optional(
    Type.Boolean({
      description: 'Perform a dry run.',
      default: false,
    }),
  ),
}, {
  additionalProperties: false,
})

Deno.writeTextFile('schema.json', JSON.stringify(schema, null, 2))
