export interface ModuleOptions {
  /**
   * The folder containing the worker files
   * Scans for {ts,js,mjs}
   * @default 'server/workers'
   */
  workers?: string
}
