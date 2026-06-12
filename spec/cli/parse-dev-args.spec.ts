import { describe, it, expect } from 'vitest'

import { parseDevArgs } from '../../src/cli/parse-dev-args'

describe('parseDevArgs', () => {
  it('defaults dir and omits optional fields when types do not match', () => {
    expect(
      parseDevArgs({
        dir: 1,
        buildDir: false,
        workers: null,
        verbose: 0,
      }),
    ).toEqual({
      dir: '.',
      buildDir: undefined,
      nodeArgs: undefined,
      workers: undefined,
      verbose: false,
    })
  })

  it('passes through string args', () => {
    expect(
      parseDevArgs({
        dir: './app',
        buildDir: '.nitro',
        nodeArgs: '--inspect',
        workers: 'basic',
        verbose: true,
      }),
    ).toEqual({
      dir: './app',
      buildDir: '.nitro',
      nodeArgs: '--inspect',
      workers: 'basic',
      verbose: true,
    })
  })
})
