import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'

const processorTypes = resolve(
  'dist/runtime/server/handlers/processor.d.mts',
)

if (!existsSync(processorTypes)) {
  execSync('npm run prepack', { stdio: 'inherit' })
} else {
  execSync('tsx scripts/assemble-types.ts', { stdio: 'inherit' })
}
