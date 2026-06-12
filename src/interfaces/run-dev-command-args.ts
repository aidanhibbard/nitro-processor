export interface RunDevCommandArgs {
  dir?: string | undefined
  buildDir?: string | undefined
  nodeArgs?: string | string[] | undefined
  workers?: string | undefined
  verbose?: boolean | undefined
}
