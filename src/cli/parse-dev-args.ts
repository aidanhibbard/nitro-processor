import type { ParsedDevArgs } from '../interfaces/parsed-dev-args'

export const parseDevArgs = (args: {
  dir?: unknown
  buildDir?: unknown
  nodeArgs?: unknown
  workers?: unknown
  verbose?: unknown
}): ParsedDevArgs => {
  return {
    dir: typeof args.dir === 'string' ? args.dir : '.',
    buildDir: typeof args.buildDir === 'string' ? args.buildDir : undefined,
    nodeArgs: args.nodeArgs as string | string[] | undefined,
    workers: typeof args.workers === 'string' ? args.workers : undefined,
    verbose: Boolean(args.verbose),
  }
}
