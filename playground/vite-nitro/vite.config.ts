import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  plugins: [nitro()],
  nitro: {
    modules: [nitroProcessor({ workers: 'server/workers' })],
  },
})
