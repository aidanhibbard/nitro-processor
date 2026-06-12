import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    { type: 'bundle', input: ['src/module.ts'], dts: true },
    { type: 'bundle', input: ['src/cli.ts'] },
  ],
})
