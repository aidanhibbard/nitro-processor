declare module '#processor' {
  export { defineQueue, defineWorker } from '../../src/runtime/server/handlers/processor'
}

declare module '#processor-utils' {
  export { useProcessor } from '../../src/runtime/server/utils/workers'
}

declare module '#bullmq' {
  export * from 'bullmq'
}
