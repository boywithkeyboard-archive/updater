type ParsedData = {
  moduleName: string
  version: string
}

export class Registry<T extends 'string' | 'url'> {
  config
  versions
  repositoryUrl
  parseImport

  constructor(
    options: {
      config: {
        name: string
        importType: T
        regex: RegExp
      }
      versions: (moduleName: string) => Promise<string[]>
      repositoryUrl: (
        moduleName: string,
      ) => Promise<string | undefined> | (string | undefined)
      parseImport: (
        data: T extends 'url' ? { importUrl: URL } : { importString: string },
      ) => ParsedData
    },
  ) {
    this.config = options.config
    this.versions = options.versions
    this.repositoryUrl = options.repositoryUrl
    this.parseImport = options.parseImport
  }
}
