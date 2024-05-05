import { getInput } from '@actions/core'
import { Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { readFileSync } from 'node:fs'
import { schema } from './schema'

type ConfigFile = Static<typeof schema>

type Config = {
  token: string
} & ConfigFile

let c: Config | undefined

function readConfigFile(path: string): ConfigFile | null {
  try {
    const str = readFileSync(path, 'utf8')

    const json = JSON.parse(str)

    if (Value.Check(schema, json)) {
      return json
    }

    return null
  } catch (_) {
    return null
  }
}

export function config() {
  if (c) {
    return c
  }

  let configFile = readConfigFile('./updater.json')

  if (!configFile) {
    configFile = readConfigFile('./.github/updater.json')
  }

  c = {
    token: getInput('token'),
    ...configFile
  }

  const 

  return c
}
