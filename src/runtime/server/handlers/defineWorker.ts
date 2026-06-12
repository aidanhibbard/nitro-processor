import type { Worker, WorkerOptions, Processor } from 'bullmq'
import { useProcessor } from '../utils/workers'

interface DefineWorkerArgs<
  NameType extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataType = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResultType = any,
> {
  name: NameType
  processor: Processor<DataType, ResultType, NameType>
  options?: Omit<WorkerOptions, 'connection'>
}

export const defineWorker = <
  NameType extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataType = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResultType = any,
>(
  args: DefineWorkerArgs<NameType, DataType, ResultType>,
): Worker<DataType, ResultType, NameType> => {
  const { name, options, processor } = args
  const { createWorker } = useProcessor()
  return createWorker<DataType, ResultType, NameType>(name, processor, options)
}
