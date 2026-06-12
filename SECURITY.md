# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x     | :white_check_mark: |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report security issues privately via [GitHub Security Advisories](https://github.com/aidanhibbard/nitro-processor/security/advisories/new) (preferred) or by emailing the repository owner through their GitHub profile contact options.

Include:

- A description of the issue and its impact
- Steps to reproduce or a proof of concept
- Affected versions and configuration (Nitro version, deployment setup, Redis exposure, etc.)

You can expect an initial response within a reasonable timeframe. We will work with you on a fix and coordinated disclosure when appropriate.

## Scope

This policy covers the **nitro-processor** package and its published runtime (module, CLI, generated workers entry). Issues in downstream dependencies (BullMQ, ioredis, Nitro, Redis itself) should be reported to those projects when they are the root cause.
