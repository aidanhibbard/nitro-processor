import { relative } from 'node:path'
import type { Plugin } from 'rollup'

import { generateEmptyWorkersIndex } from './generate-empty-workers-index'
import { generateWorkersEntryContent } from './generate-workers-entry-content'
import { generateWorkersIndexWrapper } from './generate-workers-index-wrapper'
import { scanFolder } from './scan-folder'

const VIRTUAL_ID = '\0nitro-processor-entry'

export const createWorkersRollupPlugin = (
  rootDir: string,
  workersPath: string,
): Plugin => {
  let virtualCode = ''
  let entryRefId: string | null = null

  return {
    name: 'nitro-processor-emit',
    async buildStart() {
      const workerFiles = await scanFolder(rootDir, workersPath)
      if (workerFiles.length === 0) {
        virtualCode = ''
        entryRefId = null
        return
      }
      virtualCode = generateWorkersEntryContent(workerFiles)
      for (const id of workerFiles) {
        this.addWatchFile(id)
      }
      entryRefId = this.emitFile({
        type: 'chunk',
        id: VIRTUAL_ID,
        fileName: 'workers/_entry.mjs',
      })
    },
    resolveId(id: string) {
      if (id === VIRTUAL_ID) {
        return VIRTUAL_ID
      }
      return null
    },
    load(id: string) {
      if (id === VIRTUAL_ID) {
        return virtualCode || 'export {}\n'
      }
      return null
    },
    generateBundle() {
      if (!virtualCode || !entryRefId) {
        this.emitFile({
          type: 'asset',
          fileName: 'workers/index.mjs',
          source: generateEmptyWorkersIndex(),
        })
        return
      }
      const entryFile = this.getFileName(entryRefId)
      const fromDir = 'workers'
      const rel = './' + relative(fromDir, entryFile).split('\\').join('/')
      const wrapper = generateWorkersIndexWrapper(rel)
      this.emitFile({
        type: 'asset',
        fileName: 'workers/index.mjs',
        source: wrapper,
      })
    },
  }
}
