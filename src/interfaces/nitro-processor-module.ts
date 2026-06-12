import type { Nitro } from 'nitro/types'

export interface NitroProcessorModule {
  name: string
  setup: (nitro: Nitro) => void
}
