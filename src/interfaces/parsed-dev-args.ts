export interface ParsedDevArgs {
  dir: string
  buildDir?: string | undefined
  nodeArgs?: string | string[] | undefined
  workers?: string | undefined
  verbose: boolean
}
