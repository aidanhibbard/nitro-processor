import { createMain, defineCommand } from 'citty'

import { version, name, description } from '../package.json'
import { logger } from './utils/logger'

const runDevCommand = () => {
  logger.info('nitro-processor dev is not implemented yet')
  logger.info('Start your Nitro dev server first, then run this command again')
}

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
      },
      run: runDevCommand,
    }),
  },
})
