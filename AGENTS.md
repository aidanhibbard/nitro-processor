# Agent guidelines

Conventions for humans and coding agents working in `nitro-processor`.

## Style

- **No `void`** — do not use `void` to silence unused values. Wire parameters into real behavior, or structure code so they are used.
- **Arrow functions only** — use `const fn = () => {}`, not `function fn() {}`. Avoid hoisting surprises.
- **One exported method per file** — each file exports at most one function (or default export). Supporting values belong in non-exported `const` bindings in the same file, or in dedicated files that follow the same rule.
- **No spread for defaults** — merge options with [`defu`](https://github.com/unjs/defu), not object spread.

```ts
// Good
const resolved = defu(options, defaultModuleOptions)

// Bad
const resolved = { ...defaultModuleOptions, ...options }
```

## File layout

Keep runtime code separate from type-only definitions.

| Directory | Purpose |
| --- | --- |
| `src/interfaces/` | `interface` declarations |
| `src/types/` | `type` aliases |
| `src/` | Runtime entrypoints (`module.ts`, `cli.ts`, …) |
| `src/utils/` | Shared runtime helpers |
| `src/runtime/` | Nitro server runtime (handlers, plugins, utils) |

**Do not mix** interfaces, types, and runtime logic in the same file.

## Runtime vs build-time

- `src/runtime/**` must not import from `src/utils/` (build-time). Utilities needed at runtime live under `src/runtime/`.
- Build-time code may import interfaces, types, and `defu`/`pathe`/etc.

## Tests

- Mirror `src/` under `spec/`.
- Keep **100% coverage** on `src/**/*.ts` (see `vitest.config.ts`).
- Add or update specs when changing exported behavior.

## Tooling

- **ESLint** — strict TypeScript + Prettier via `eslint-plugin-prettier` (single quotes, no semicolons). No standalone Prettier CLI.
- **TypeScript** — strict options in `tsconfig.json`; do not weaken them for convenience.
- **Build** — `obuild`; runtime tree uses `transform` when `src/runtime/` exists.

## Commits & CI

- Run `npm run ci` before finishing work.
- Focused diffs; match existing naming and import style (`verbatimModuleSyntax`, type-only imports).
