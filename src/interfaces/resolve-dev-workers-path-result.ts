export interface ResolveDevWorkersPathResult {
  indexFile: string
  watchDir: string
  buildDir: string
  found: boolean
  tried: string[]
  explicit: boolean
}
