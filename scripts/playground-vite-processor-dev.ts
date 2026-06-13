import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const playgroundRoot = resolve(rootDir, 'playground/vite-nitro')
const devWorkersIndex = resolve(
  playgroundRoot,
  'node_modules/.nitro/dev/workers/index.mjs',
)
const prodWorkersIndex = resolve(
  playgroundRoot,
  '.output/server/workers/index.mjs',
)
const cliPath = resolve(rootDir, 'bin/nitro-processor.mjs')

const ensureDevWorkersIndex = (): void => {
  if (existsSync(devWorkersIndex)) {
    return
  }
  if (!existsSync(prodWorkersIndex)) {
    throw new Error(
      `Missing workers entry after vite build: ${prodWorkersIndex}`,
    )
  }
  mkdirSync(dirname(devWorkersIndex), { recursive: true })
  cpSync(prodWorkersIndex, devWorkersIndex)
}

const runProcessorDev = (): Promise<number> => {
  return new Promise((resolveExit, reject) => {
    const child = spawn('node', [cliPath, 'dev', playgroundRoot], {
      cwd: playgroundRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        REDIS_URL: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379/0',
      },
    })

    let output = ''
    const appendOutput = (chunk: Buffer) => {
      output += chunk.toString()
    }

    child.stdout?.on('data', appendOutput)
    child.stderr?.on('data', appendOutput)

    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
    }, 8000)

    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    child.on('exit', (code, signal) => {
      clearTimeout(timeout)
      if (signal === 'SIGTERM') {
        if (
          output.includes('starting workers') ||
          output.includes('workers started') ||
          output.includes('ECONNREFUSED') ||
          output.includes('failed to start workers')
        ) {
          resolveExit(0)
          return
        }
        reject(
          new Error(
            `nitro-processor dev produced no expected output:\n${output}`,
          ),
        )
        return
      }
      resolveExit(code ?? 1)
    })
  })
}

ensureDevWorkersIndex()
const exitCode = await runProcessorDev()
process.exit(exitCode)
