import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'

export const resolvePackageRoot = (fromUrl: string | URL): string => {
  let dir = dirname(fileURLToPath(fromUrl))

  while (dir !== dirname(dir)) {
    const pkgPath = resolve(dir, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
          name?: string
        }
        if (pkg.name === 'nitro-processor') {
          return dir
        }
      } catch {
        // keep walking
      }
    }
    dir = dirname(dir)
  }

  throw new Error('nitro-processor package root not found')
}
