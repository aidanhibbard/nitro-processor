import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDir = resolve(import.meta.dirname, '..')
const ambientTypes = readFileSync(
  resolve(rootDir, 'src/types.d.mts'),
  'utf8',
).trimEnd()

const types = `${ambientTypes}

export { default } from './module.mjs'
export type { ModuleOptions } from './module.mjs'
`

writeFileSync(resolve(rootDir, 'dist/types.d.mts'), types)

const virtualTypes = `${ambientTypes}
`

writeFileSync(resolve(rootDir, 'dist/virtual.d.mts'), virtualTypes)
