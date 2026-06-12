import type { Nitro } from 'nitro/types'

export interface ModuleOptions {
  /**
   * The folder containing the worker files
   * Scans for {ts,js,mjs}
   * @default 'server/workers'
   */
  workers?: string
}

export interface NitroProcessorModule {
  name: string
  setup: (nitro: Nitro) => void | Promise<void>
}

export default function nitroProcessor(
  options: ModuleOptions = {},
): NitroProcessorModule {
  const resolvedOptions: Required<ModuleOptions> = {
    workers: 'server/workers',
    ...options,
  }

  return {
    name: 'nitro-processor',
    setup(nitro: Nitro) {
      void nitro
      void resolvedOptions
    },
  }
}
