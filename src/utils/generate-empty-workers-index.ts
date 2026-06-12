export const generateEmptyWorkersIndex = (): string => {
  return (
    `import { consola } from 'consola'\n` +
    `const logger = consola.create({}).withTag('nitro-processor')\n` +
    `logger.warn('No worker files found; workers entry is empty')\n` +
    `process.exit(0)\n`
  )
}
