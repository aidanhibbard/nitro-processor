export interface StopAllOptions {
  force?: boolean
  timeoutMs?: number
}

export interface StopAllResult {
  ok: boolean
  errors: Error[]
}
