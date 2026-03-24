# Codebase Structure

**Analysis Date:** 2026-03-24

## Directory Layout

```
tappay-backend-payment-npm/
├── src/                        # Source code (TypeScript)
│   ├── config/                # Configuration constants and types
│   │   ├── Env.ts            # API environment endpoints
│   │   └── TapPayConfig.ts    # Client config interface
│   ├── domain/                # Domain types and value objects
│   │   ├── Cardholder.ts      # Cardholder personal information
│   │   ├── CardInfo.ts        # Card details and secrets
│   │   └── ResultUrl.ts       # 3D Secure/e-payment result URLs
│   ├── enums/                 # Enumeration constants
│   │   ├── CardType.ts        # Card type definitions
│   │   └── Currency.ts        # ISO 4217 currency codes and multipliers
│   ├── errors/                # Custom error classes
│   │   ├── TapPayError.ts     # Base error with status code
│   │   ├── TapPayConfigError.ts      # Configuration validation error
│   │   ├── TapPayValidationError.ts  # Input validation error
│   │   └── TapPayTimeoutError.ts     # Request timeout error
│   ├── payments/              # API request/response types
│   │   ├── PaymentRequest.ts  # All payment request interfaces
│   │   └── PaymentResponse.ts # All response interfaces
│   ├── TapPayClient.ts        # Main SDK client class
│   └── index.ts               # Public API exports
├── tests/
│   └── index.test.ts          # Comprehensive test suite
├── dist/                       # Compiled output (generated)
│   ├── index.mjs              # ESM bundle
│   ├── index.cjs              # CommonJS bundle
│   ├── index.d.ts             # TypeScript declarations
│   ├── index.mjs.map          # ESM source map
│   ├── index.cjs.map          # CommonJS source map
│   └── index.d.ts.map         # Declaration map
├── doc/                        # Documentation (if any)
├── .planning/                  # GSD planning documents
├── .github/                    # GitHub actions and CI/CD
├── build.ts                    # Build script (Bun)
├── biome.json                  # Code formatter/linter config
├── tsconfig.json               # TypeScript compiler config
├── tsconfig.build.json         # TypeScript build-specific config
├── package.json                # Package metadata and scripts
├── bun.lock                    # Bun lockfile
├── bunfig.toml                 # Bun runtime config
├── README.md                   # English documentation
├── README_zh-TW.md             # Traditional Chinese documentation
├── CHANGELOG.md                # Release notes and changes
├── CONTRIBUTING.md             # Contribution guidelines
└── LICENSE                     # MIT license
```

## Directory Purposes

**src/config/:**
- Purpose: Configuration constants and initialization types
- Contains: Environment endpoints (`Env.Sandbox`, `Env.Production`), client config interface
- Key files: `Env.ts`, `TapPayConfig.ts`
- Mutability: Immutable constants
- Exports to public API: `Env`, `TapPayConfig` type

**src/domain/:**
- Purpose: Domain entities and business value objects
- Contains: `Cardholder` (personal info), `CardInfo` (card details), `CardSecret` (card tokens), `ResultUrl` (3D Secure URLs)
- Key files: `Cardholder.ts`, `CardInfo.ts`, `ResultUrl.ts`
- Mutability: All types are immutable interfaces (no setters)
- Exports to public API: `Cardholder`, `CardInfo`, `CardSecret`, `ResultUrl` types

**src/enums/:**
- Purpose: Enumeration constants for system types
- Contains: `Currency` (13 currencies + multiplier map), `CardType` (card type identifiers)
- Key files: `Currency.ts` (90 lines), `CardType.ts`
- Pattern: Const objects with type extraction (`as const` + `typeof` pattern)
- Exports to public API: `Currency`, `CardType`, `CurrencyMultiplier`

**src/errors/:**
- Purpose: Domain-specific error classes for error handling
- Contains: Error hierarchy (`TapPayError` base, then `Config`/`Validation`/`Timeout` errors)
- Key files: All 4 error classes
- Pattern: Extends native `Error`, captures stack trace
- Exports to public API: All 4 error classes

**src/payments/:**
- Purpose: API request and response type definitions
- Contains: 10+ request types (`PayByPrimeRequest`, `RefundRequest`, etc.), 8+ response types
- Key files: `PaymentRequest.ts` (200+ lines), `PaymentResponse.ts` (200+ lines)
- Pattern: Interfaces matching TapPay API contract exactly
- Exports to public API: All request and response types

**src/TapPayClient.ts:**
- Purpose: Main SDK client - implements all API methods
- Contains: Single class with 11 public methods, 1 private validation method, 1 private sendRequest method
- Size: 743 lines
- Exports to public API: `TapPayClient` class
- Responsibilities:
  - Configuration management
  - Input validation
  - API request construction
  - HTTP communication
  - Error handling and conversion
  - Response typing

**src/index.ts:**
- Purpose: Public API entry point - barrel file
- Contains: Re-exports of all public types and classes
- Size: 113 lines
- Organization: Grouped by category (Configuration, Domain Types, Enums, Errors, Requests, Responses, Core Client)
- Pattern: Selective exports only (not re-exporting internal helpers)

**tests/index.test.ts:**
- Purpose: Comprehensive test coverage
- Contains: 100%+ coverage of all public methods and error paths
- Test types: Unit tests with mocked fetch
- Framework: Bun built-in test runner
- Location: Placed alongside main code (not in separate test directory outside tests/)

**dist/:**
- Purpose: Compiled output for distribution
- Contains: ESM module, CommonJS module, TypeScript declarations
- Generated by: `bun run build` script
- Committed: No (generated, should be in .gitignore)

## Key File Locations

**Entry Points:**
- `src/index.ts`: Public API barrel file - all exports start here
- `src/TapPayClient.ts`: Main client class - where all API methods live

**Configuration:**
- `tsconfig.json`: TypeScript compiler configuration (ESNext target, strict mode)
- `biome.json`: Code style configuration (Biomejs linter/formatter)
- `package.json`: Package metadata, scripts, dependencies
- `bunfig.toml`: Bun runtime configuration

**Core Logic:**
- `src/TapPayClient.ts`: 743-line client with all 11 API methods
- `src/payments/PaymentRequest.ts`: Request type definitions (10+ types)
- `src/payments/PaymentResponse.ts`: Response type definitions (8+ types)
- `src/errors/`: 4-file error hierarchy

**Testing:**
- `tests/index.test.ts`: Single comprehensive test file (100% coverage target)

## Naming Conventions

**Files:**
- PascalCase for class files: `TapPayClient.ts`, `PaymentRequest.ts`
- camelCase for utility/config files: `build.ts`
- UPPERCASE for config files: `Env.ts` (follows Bun convention), `Currency.ts`
- Descriptive names reflecting class/interface: `TapPayError.ts`, `TapPayConfigError.ts`

**Directories:**
- lowercase, singular or plural plural based on purpose:
  - `src/` (source code)
  - `src/config/` (configuration files)
  - `src/domain/` (domain entities)
  - `src/enums/` (enumeration constants)
  - `src/errors/` (error classes)
  - `src/payments/` (payment-related types)
  - `tests/` (test files)
  - `dist/` (distribution output)

**Type Names:**
- PascalCase for interfaces/types: `TapPayClient`, `PaymentResponse`, `Cardholder`
- Suffix `Error` for error classes: `TapPayError`, `TapPayConfigError`
- Suffix `Request`/`Response` for API contracts: `PayByPrimeRequest`, `RefundResponse`
- Suffix `Config` for configuration interfaces: `TapPayConfig`

**Constants:**
- UPPER_CASE for enum values: `Currency.TWD`, `Currency.USD`, `Env.Sandbox`
- camelCase for other constants: `DEFAULT_TIMEOUT`

## Where to Add New Code

**New Payment Method:**
1. Add request interface to `src/payments/PaymentRequest.ts` (e.g., `NewPaymentRequest`)
2. Add response interface to `src/payments/PaymentResponse.ts` (e.g., `NewPaymentResponse`)
3. Add public method to `src/TapPayClient.ts`:
   ```typescript
   async newPayment(
     options: Omit<NewPaymentRequest, 'partner_key' | 'merchant_id'>
   ): Promise<NewPaymentResponse> {
     // Validate inputs
     // Construct request with config
     // Call this.sendRequest<NewPaymentResponse>(endpoint, body)
   }
   ```
4. Export from `src/index.ts` (add to Request/Response sections)
5. Add test cases to `tests/index.test.ts`

**New Domain Type:**
1. Create file in `src/domain/` with descriptive name: `src/domain/NewEntity.ts`
2. Export interface using JSDoc comments (see `Cardholder.ts` pattern)
3. Export from `src/index.ts` in Domain Types section

**New Error Type:**
1. Create file in `src/errors/` following pattern: `src/errors/NewSpecificError.ts`
2. Extend appropriate base error (`TapPayError` or custom base)
3. Capture stack trace with `Error.captureStackTrace`
4. Export from `src/index.ts` in Errors section

**New Configuration:**
1. Add constant to appropriate file in `src/config/`:
   - Environment URLs → `src/config/Env.ts`
   - Client options → extend `src/config/TapPayConfig.ts`
2. Export from `src/index.ts`

**New Enumeration:**
1. Create file in `src/enums/` with descriptive name
2. Use `const` with `as const` for type safety:
   ```typescript
   export const NewEnum = {
     Value1: 'value_1',
     Value2: 'value_2',
   } as const
   export type NewEnum = (typeof NewEnum)[keyof typeof NewEnum]
   ```
3. Export from `src/index.ts`

**Utilities (if needed):**
- Currently no utility functions
- If needed: Create `src/utils/` directory
- Keep utilities focused and small
- Co-locate with related code if used by single module

## Special Directories

**dist/:**
- Purpose: Distribution output for npm package
- Generated: Yes (via `bun run build` script)
- Committed: No - should be .gitignore'd (currently not shown in repo state)
- Contents: ESM (.mjs), CommonJS (.cjs), TypeScript declarations (.d.ts)

**.planning/codebase/:**
- Purpose: GSD (Global Software Delivery) planning documents
- Generated: By GSD tools (this directory you're reading)
- Committed: Yes (checked in for team reference)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

**.github/:**
- Purpose: GitHub Actions CI/CD workflows
- Contents: Release automation, testing pipelines
- Committed: Yes

## Module Entry Points

**Public Entry Point:**
- `src/index.ts` - All public API exports go through here
- Pattern: Barrel file with organized sections (Configuration, Domain, Enums, Errors, Requests, Responses, Core Client)

**Package Entry Points (package.json):**
- `main: "./dist/index.cjs"` - CommonJS require()
- `module: "./dist/index.mjs"` - ES6 import
- `types: "./dist/index.d.ts"` - TypeScript definitions
- `exports: { ".": { ... } }` - Modern conditional exports (subpath support)

**Internal Imports:**
- Use relative paths: `import { TapPayError } from './errors/TapPayError'`
- No path aliases configured (simple relative imports)
- Circular dependencies: None (unidirectional dependency graph)

---

*Structure analysis: 2026-03-24*
