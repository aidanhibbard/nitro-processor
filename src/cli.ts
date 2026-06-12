import { createMain, defineCommand } from 'citty'

import { version, name, description } from '../package.json'
import { parseDevArgs } from './cli/parse-dev-args'
import { runDevCommand } from './cli/run-dev-command'

export const main = createMain({
  meta: {
    name,
    description,
    version,
  },
  subCommands: {
    dev: defineCommand({
      meta: {
        name: 'dev',
        description: 'Run workers with HMR from the Nitro dev workers entry',
      },
      args: {
        dir: {
          type: 'positional',
          default: '.',
        },
        buildDir: {
          type: 'string',
          description:
            'Nitro buildDir relative to project root (disables auto-probe)',
        },
        nodeArgs: {
          type: 'string',
          description: 'Extra Node args (e.g. --inspect)',
        },
        workers: {
          type: 'string',
          description:
            'Workers to run, comma-separated; use --workers=name1,name2 (default: all)',
        },
        verbose: {
          type: 'boolean',
          description: 'Log resolved watch paths',
        },
      },
      run: async ({ args }) => {
        await runDevCommand(parseDevArgs(args))
      },
    }),
  },
})
