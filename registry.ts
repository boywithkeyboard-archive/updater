type ParsedData = {
  moduleName: string
  version: string
}

export class Registry<T extends 'string' | 'url'> {
  options

  constructor(
    options: {
      config: {
        name: string
        importType: T
        regex: RegExp
      }
      versions: (moduleName: string) => Promise<string[]>
      repositoryUrl: (
        data: ParsedData,
      ) => Promise<string | undefined> | (string | undefined)
      parseImport: (
        data: T extends 'url' ? { importUrl: URL } : { importString: string },
      ) => ParsedData
    },
  ) {
    this.options = options
  }
}
