import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('published types', () => {
  it('ships ambient modules and runtime declarations for plain tsc', () => {
    const typesPath = resolve('dist/types.d.mts')
    const virtualPath = resolve('dist/virtual.d.mts')
    const runtimeEntryPath = resolve('dist/runtime-entry.d.mts')
    const workersTypesPath = resolve(
      'dist/runtime/server/utils/workers.d.mts',
    )
    const processorTypesPath = resolve(
      'dist/runtime/server/handlers/processor.d.mts',
    )

    expect(readFileSync(typesPath, 'utf8')).toContain("declare module '#processor'")
    expect(readFileSync(typesPath, 'utf8')).toContain(
      "declare module '#processor-utils'",
    )
    expect(readFileSync(typesPath, 'utf8')).toContain("declare module '#bullmq'")
    expect(readFileSync(virtualPath, 'utf8')).toContain(
      "declare module '#processor-utils'",
    )
    expect(readFileSync(runtimeEntryPath, 'utf8')).toContain('defineQueue')
    expect(readFileSync(runtimeEntryPath, 'utf8')).toContain('useProcessor')
    expect(readFileSync(workersTypesPath, 'utf8')).toContain('useProcessor')
    expect(readFileSync(processorTypesPath, 'utf8')).toContain('defineWorker')
  })
})
