import { defineConfig } from 'nitro/config'
import nitroProcessor from '../../src/module'

export default defineConfig({
  modules: [nitroProcessor({ workers: 'server/workers' })],
})
