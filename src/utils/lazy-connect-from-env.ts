export const lazyConnectFromEnv = (value: string | undefined): boolean | '' => {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return ''
}
