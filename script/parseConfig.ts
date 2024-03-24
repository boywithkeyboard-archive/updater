import { schema } from '../schema.ts'
import { Value } from 'typebox/value'
import { Static } from 'typebox'

function readConfigFile(path: string): Static<typeof schema> | null {
  try {
    const str = Deno.readTextFileSync(path)

    const json = JSON.parse(str)

    // @ts-ignore:
    if (Value.Check(schema, json)) {
      return json
    }

    return null
  } catch (_err) {
    return null
  }
}

export function parseConfig() {
  let config = readConfigFile('./updater.json')

  if (config === null) {
    config = readConfigFile('./.github/updater.json')
  }

  return config ?? {}
}
