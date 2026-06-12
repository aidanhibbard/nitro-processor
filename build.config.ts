import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    { type: 'bundle', input: ['src/module.ts'], dts: true },
    { type: 'bundle', input: ['src/cli.ts'] },
    { type: 'transform', input: './src/runtime', outDir: './dist/runtime' },
    { type: 'transform', input: './src/types.d.mts', outDir: './dist' },
  ],
})
