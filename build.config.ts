import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    { type: 'bundle', input: ['src/module.ts'], dts: true },
    { type: 'bundle', input: ['src/cli.ts'] },
    { type: 'bundle', input: ['src/runtime-entry.ts'], dts: true },
    { type: 'transform', input: './src/runtime', outDir: './dist/runtime' },
  ],
})
