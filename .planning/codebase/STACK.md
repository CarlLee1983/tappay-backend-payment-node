# Technology Stack

**Analysis Date:** 2026-03-24

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase including source, tests, and build scripts
- JavaScript (Output) - ESM and CJS distributions

## Runtime

**Environment:**
- Node.js 18.0.0+ (specified in `engines.node`)
- Bun (primary runtime for development/testing)

**Package Manager:**
- Bun (development)
- npm (distribution/consumption)
- Lockfile: `bun.lock` present (Bun v1 format)

## Frameworks

**Core:**
- Native Fetch API - HTTP client (no external HTTP library dependency)
- TypeScript Standard Library - Core language features

**Testing:**
- Bun Test - Built-in test runner (`bun test`)
- Bun Coverage - Coverage reporting (`bun test --coverage`)

**Build/Dev:**
- Bun.build() - Bundle building (ESM and CJS formats)
- TypeScript Compiler (tsc) - Type declaration generation
- Biome 2.3.8 - Linting and code formatting

## Key Dependencies

**Zero Production Dependencies:**
- SDK uses only native Node.js APIs (fetch, AbortController, setTimeout)
- No external runtime libraries required

**Development Dependencies:**
- `@biomejs/biome` ^2.3.8 - Linting and formatting
- `@types/bun` latest - Type definitions for Bun runtime
- `typescript` ^5.9.3 - TypeScript compiler
- `lint-staged` ^16.2.7 - Pre-commit linting
- `simple-git-hooks` ^2.13.1 - Git hooks management

## Configuration

**Environment:**
- Dual environment support: Sandbox and Production
- Environment-based API endpoint selection:
  - Sandbox: `https://sandbox.tappaysdk.com`
  - Production: `https://prod.tappaysdk.com`
- API authentication: Partner Key sent via `x-api-key` header
- Configurable timeout: Default 30 seconds (30000ms)

**Build:**
- `biome.json` - Linting and formatting rules
- `tsconfig.json` - TypeScript compiler options with strict mode enabled
- `tsconfig.build.json` - Build-specific TypeScript configuration
- `bunfig.toml` - Bun runtime configuration

## Platform Requirements

**Development:**
- Node.js >= 18.0.0
- Bun runtime (latest)
- macOS/Linux/Windows (Biome provides platform-specific binaries)

**Production:**
- Node.js >= 18.0.0 (for native fetch API)
- Browser compatibility: Not applicable (backend SDK only)

## Distribution

**Package Details:**
- Name: `@carllee1983/tappay-backend-payment-node`
- Current Version: 1.7.0 (from package.json)
- Published to: NPM Registry (https://registry.npmjs.org/)
- Access: Public

**Export Formats:**
- ESM: `./dist/index.mjs`
- CJS: `./dist/index.cjs`
- Type Definitions: `./dist/index.d.ts`

**Bundling Strategy:**
1. Clean dist directory
2. Build ESM bundle with external sourcemap
3. Build CJS bundle with external sourcemap
4. Generate TypeScript declarations from `tsconfig.build.json`
5. All builds use `target: 'node'`

---

*Stack analysis: 2026-03-24*
