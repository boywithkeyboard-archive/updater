// Copyright 2023 Samuel Kopp. All rights reserved. MIT license.
export type Registry = {
  registryName: string
  urlPrefix: string
  fetchReleases: (moduleName: string) => Promise<string[] | undefined>
  fetchRepositoryUrl: (moduleName: string) => Promise<string | undefined>
  parseUrl: (url: string) => { moduleName: string; version: string } | undefined
}
