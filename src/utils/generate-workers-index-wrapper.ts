const DEFAULT_SHUTDOWN_TIMEOUT_MS = 25000

export const generateWorkersIndexWrapper = (
  entryImportPath: string,
  options?: { shutdownTimeoutMs?: number },
): string => {
  const shutdownTimeoutMs =
    options?.shutdownTimeoutMs ?? DEFAULT_SHUTDOWN_TIMEOUT_MS
  return (
    `import { createWorkersApp } from '${entryImportPath}'\n` +
    `import { consola } from 'consola'\n` +
    `const logger = consola.create({}).withTag('nitro-processor')\n` +
    `const SHUTDOWN_TIMEOUT_MS = ${String(shutdownTimeoutMs)}\n` +
    `const appPromise = createWorkersApp().catch((err) => { logger.error('failed to start workers', err); process.exit(1) })\n` +
    `let shuttingDown = false\n` +
    `const shutdown = async (signal) => { if (shuttingDown) return; shuttingDown = true; let exitCode = 0; try { logger.info('closing workers' + (signal ? ' ('+signal+')' : '') + '...') } catch (e) { console.warn('nitro-processor: failed to log shutdown start', e) } ; try { const app = await appPromise; try { const names = (app?.workers || []).map(w => w && w.name).filter(Boolean); logger.info('closing workers:\\n' + names.map(n => ' - ' + n).join('\\n')) } catch (eL) { console.warn('nitro-processor: failed to log workers list on shutdown', eL) } await app.stop({ timeoutMs: SHUTDOWN_TIMEOUT_MS }); try { logger.success('workers closed') } catch (e2) { console.warn('nitro-processor: failed to log shutdown complete', e2) } } catch (err) { exitCode = 1; try { logger.error('shutdown error', err) } catch (e3) { console.warn('nitro-processor: failed to log shutdown error', e3) } } finally { setTimeout(() => process.exit(exitCode), 0) } }\n` +
    `[ 'SIGINT','SIGTERM','SIGQUIT' ].forEach(sig => process.on(sig, () => shutdown(sig)))\n`
  )
}
