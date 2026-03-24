# Codebase Concerns

**Analysis Date:** 2026-03-24

## Tech Debt

### String Validation Logic Duplication

**Issue:** Repetitive validation pattern (`.trim() === ''`) used across 17 locations in `TapPayClient.ts`

**Files:**
- `src/TapPayClient.ts` (lines 102-108, 260-270, 312-330, 376-383, 417-423, 456-458, 489-491, 542-548, etc.)

**Impact:**
- Violates DRY principle, making validation changes difficult to maintain
- Inconsistent validation logic if updates needed
- Harder to add new validation rules

**Fix approach:**
Extract validation logic into reusable helper functions in a dedicated validator module:
```
src/utils/validators.ts:
- validateRequired(value: string, fieldName: string)
- validateAmount(amount: number, fieldName: string)
- validateConfig(config: TapPayConfig)
```

---

### File Size and Complexity in TapPayClient

**Issue:** `TapPayClient.ts` is 742 lines with 11 public async methods, mixing payment, transaction, and card management concerns

**Files:** `src/TapPayClient.ts`

**Impact:**
- Difficult to test individual concerns
- High risk of bugs when adding new API methods
- Violates Single Responsibility Principle

**Fix approach:**
- Extract payment operations into `PaymentService` (payByPrime, payByToken)
- Extract transaction management into `TransactionService` (refund, capToday, cancelCapture, etc.)
- Extract card management into `CardService` (bindCard, removeCard)
- Keep TapPayClient as facade/orchestrator with dependency injection

**Priority:** Medium - Consider for refactor when adding new payment methods

---

### RequestResponse Interface Duplication in PaymentRequest

**Issue:** Multiple request interfaces (PayByPrimeRequest, PayByTokenRequest, BindCardRequest, etc.) contain significant repeated field definitions

**Files:** `src/payments/PaymentRequest.ts` (lines 1-452)

**Impact:**
- Code duplication makes updates cumbersome
- Risk of inconsistent field definitions across similar request types
- Harder to add fields consistently

**Fix approach:**
Create base request type:
```typescript
// src/payments/BasePaymentRequest.ts
export interface BasePaymentRequest {
  partner_key: string
  merchant_id?: string
  amount?: number
  currency?: Currency
  order_number?: string
  details?: string
  cardholder?: Cardholder
  result_url?: ResultUrl
  three_domain_secure?: boolean
}
```
Then: `interface PayByPrimeRequest extends BasePaymentRequest { prime: string }`

**Priority:** Low - Not blocking, improves maintainability

---

## Known Gaps

### No Input Schema Validation Library

**Issue:** Manual validation using simple string checks instead of schema validation (e.g., Zod, Joi, AJV)

**Files:**
- `src/TapPayClient.ts` (validateConfig method, request method validation blocks)

**Impact:**
- No runtime validation of complex nested objects (cardholder, result_url)
- Type safety doesn't guarantee runtime validation
- Difficult to document validation rules in schema

**Mitigation:** Currently acceptable because:
- Only primitive types and structured types used
- Type checking catches most issues at compile time
- Biome linter enforces strict typing

**Recommendation for future:**
If adding more complex request types, consider lightweight schema validation (Zod is TypeScript-first and tree-shakeable for npm packages)

---

### Limited Error Recovery Information

**Issue:** Timeout errors and network errors lack detailed retry guidance

**Files:** `src/TapPayClient.ts` (lines 203-215)

**Impact:**
- Developers may not know if they should retry (timeout vs. validation error)
- No exponential backoff guidance in error messages
- Missing idempotency key recommendation for retries

**Fix approach:**
Extend error classes with retry metadata:
```typescript
class TapPayTimeoutError extends Error {
  readonly isRetryable = true
  readonly suggestedRetryDelay = 1000
}
```
And document idempotency best practice in comments

**Priority:** Low - Documented in README examples

---

## Dependencies at Risk

### TypeScript Version Constraint

**Risk:** Currently TypeScript `^5.9.3` but TS 6.0.2 available

**Files:** `package.json` (line 73)

**Impact:**
- Missing improvements in TS 6.0 (better error messages, performance)
- May be incompatible with future Node.js versions
- Dependency drift over time

**Migration plan:**
- Update to `^6.0.0` when:
  - Biome 2.5+ confirms compatibility
  - Package consumers request TS 6 support
  - No breaking changes in strict mode compilation

**Current recommendation:** Bump to `^6.0.2` is low-risk

---

### Outdated Dev Dependencies

**Issue:** Multiple dev dependencies have newer versions available:
- `@biomejs/biome`: 2.3.8 → 2.4.8
- `@types/bun`: 1.3.4 → 1.3.11
- `lint-staged`: 16.2.7 → 16.4.0
- `typescript`: 5.9.3 → 6.0.2

**Files:** `package.json` (devDependencies)

**Impact:**
- Missing bug fixes in Biome linter
- Potential security updates in lint-staged
- Better TypeScript error messages and performance

**Fix approach:**
Run:
```bash
npm update --save-dev
# or selective:
npm install --save-dev typescript@^6.0.2 @biomejs/biome@^2.4.8
```

**Priority:** Medium - Do in next release cycle

---

## Performance Observations

### Timeout Handling with Implicit Cleanup

**Concern:** AbortController timeout cleanup relies on finally block (line 216-220)

**Files:** `src/TapPayClient.ts`

**Current approach:**
```typescript
let timeoutId: ReturnType<typeof setTimeout> | undefined
try {
  timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
  // ...
} finally {
  if (timeoutId) clearTimeout(timeoutId)
}
```

**Observation:**
- Correct implementation, but clearing timeout after abort is redundant
- Minor optimization: clear immediately on response success
- **No action needed** - current code is safe and clear

---

### Default Timeout Configuration

**Value:** 30 seconds (30000ms) is appropriate

**Files:** `src/TapPayClient.ts` (line 36)

**Assessment:**
- Aligns with TapPay's peak-hour recommendation
- Sufficient for financial transactions
- User can override via config

**Recommendation:** Document why 30s is default in README (already done ✓)

---

## Code Quality - Non-Functional

### Exception Type Hierarchy Clarity

**Observation:** Error classes extend Error directly but don't inherit from TapPayError

**Files:**
- `src/errors/TapPayTimeoutError.ts`
- `src/errors/TapPayValidationError.ts`
- `src/errors/TapPayConfigError.ts`

**Current structure:**
```typescript
// Each extends Error independently
export class TapPayTimeoutError extends Error { ... }
export class TapPayValidationError extends Error { ... }
```

**Assessment:**
- This is intentional and correct for error discrimination
- Allows catching specific errors without instanceof checks
- Alternative pattern: `class TapPayTimeoutError extends TapPayError` would be less flexible

**Recommendation:** Keep as-is. Document error hierarchy in README (consider adding error handling guide)

---

### Test Coverage Assessment

**Current state:**
- Single test file with 163 test/describe blocks
- Covers all public APIs, enums, and error classes
- Coverage threshold: 100% enforced in CI (`test:ci` script)

**Files:** `tests/index.test.ts` (1204 lines)

**Observations:**
- All critical paths tested
- Edge cases covered (empty strings, negative amounts, etc.)
- Mock patterns consistent

**Recommendation:** Consider organizing tests by feature:
```
tests/
├── client.test.ts
├── errors.test.ts
├── enums.test.ts
├── integration.test.ts
```
But not blocking - current monolithic file is acceptable for SDK size

---

### Build Process Observations

**Current:** Bun-based build with dual output (ESM + CJS)

**Files:** `build.ts`

**Assessment:**
- Modern build approach for npm packages
- Proper source maps for debugging
- Type declarations generated separately ✓

**Potential improvement:**
- Consider bundling type declarations with minified version for production
- Current setup is good for npm distribution

---

## Security Considerations

### Partner Key in Headers vs Body

**Pattern:** `partner_key` sent in both request body AND `x-api-key` header

**Files:** `src/TapPayClient.ts` (lines 144, 275, 335)

**Observation:**
- Follows TapPay API specification
- Header transport is standard for API keys
- Body inclusion may be redundant but required by TapPay

**Assessment:** No change needed - following API spec

---

### No Rate Limiting Protection

**Issue:** Client makes no provisions for rate limit handling

**Files:** `src/TapPayClient.ts`

**Impact:**
- Applications using SDK not protected from rate limit errors
- No backoff recommendations when 429 returned

**Mitigation:**
- Error documentation should recommend rate-limit handling
- TapPay rate limits handled server-side

**Recommendation for future:**
Add rate-limit aware error response with `retry-after` header parsing

**Priority:** Low - Documented in SDK usage guide

---

### Sensitive Data in Error Responses

**Issue:** Error messages include potentially sensitive API response data

**Files:** `src/TapPayClient.ts` (lines 150-169, 177-189)

**Current behavior:**
- Error messages include response text/JSON
- Truncated to 500 chars if non-JSON
- Includes rec_trade_id in error (appropriate for debugging)

**Assessment:**
- Reasonable for development/debugging
- Production applications should scrub sensitive fields
- Error objects don't expose PII by default

**Recommendation:**
Add error scrubbing utilities for production (future enhancement):
```typescript
// src/utils/errorScrubbers.ts
export function scrubErrorForLogging(error: TapPayError): string {
  // Remove card info, amounts, etc. from error messages
}
```

---

## Missing Critical Features

### No Webhook Verification Helpers

**Issue:** SDK handles HTTP requests but lacks helpers for webhook signature verification

**Files:** None (not implemented)

**Impact:**
- SDK consumers must implement webhook verification themselves
- Risk of duplicate/replay attacks if not verified

**Recommendation for future phase:**
Add webhook verification utilities:
```typescript
export function verifyTapPayWebhook(
  payload: BackendNotifyPayload,
  signature: string,
  partnerKey: string
): boolean { ... }
```

**Priority:** Medium - Important for production deployments

---

### No Exponential Backoff/Retry Utilities

**Issue:** SDK doesn't provide retry helpers, forcing consumers to implement

**Files:** None (not implemented)

**Impact:**
- Inconsistent retry logic across applications
- Increased risk of race conditions

**Recommendation for future phase:**
Add utilities:
```typescript
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 100
): Promise<T> { ... }
```

**Priority:** Low - Can be implemented by consumers

---

### No Request/Response Logging Hooks

**Issue:** No built-in way to log requests/responses for debugging

**Files:** `src/TapPayClient.ts`

**Impact:**
- Debugging requires monkey-patching fetch
- No structured logging capability

**Recommendation for future:**
Add optional logging handler to TapPayConfig:
```typescript
export interface TapPayConfig {
  // ... existing fields
  onRequestLog?: (method: string, url: string, body: unknown) => void
  onResponseLog?: (status: number, data: unknown) => void
}
```

**Priority:** Low - Can be added without breaking changes

---

## Test Coverage Gaps

### No Integration Tests Against Real TapPay Sandbox

**What's not tested:** Live API calls to TapPay sandbox environment

**Files:** `tests/index.test.ts` (uses mocked fetch)

**Risk:**
- Breaking changes in TapPay API not caught until production
- Response format changes undetected

**Safe approach (current):**
- Mock all responses (implemented ✓)
- Document manual testing steps for sandbox in CONTRIBUTING.md

**Recommendation for future:**
- Add optional integration test suite (skip by default, manual trigger)
- Can be added without blocking releases

**Priority:** Low - Mocked tests are sufficient

---

### No Error Scenario Testing for All Response Types

**What's partially tested:** Error responses for payByPrime, refund, bindCard

**What's missing:** Error handling for getRecords, getTransaction, getTradeHistory

**Files:** `tests/index.test.ts`, `src/TapPayClient.ts` (lines 627-728)

**Risk:** Edge cases in transaction query methods may not be handled properly

**Fix approach:**
Add test cases for each query method's error scenarios

**Priority:** Medium - Low risk since pattern is consistent

---

## Refactoring Opportunities (Non-Critical)

### Consider Const Assertion for Enums

**Current pattern:**
```typescript
export const Currency = { TWD: 'TWD', ... } as const
export type Currency = (typeof Currency)[keyof typeof Currency]
```

**Assessment:** Already using best practice `as const` pattern ✓

---

### Barrel File Organization

**Current:** All exports in `src/index.ts`

**Assessment:** Appropriate for single-file SDK, exports are well-organized ✓

---

## Summary of Action Items

| Area | Issue | Priority | Effort | Blocks |
|------|-------|----------|--------|--------|
| Validation | Duplicate string validation logic | Medium | 2-3h | No |
| Architecture | TapPayClient oversized | Medium | 4-6h | No |
| Dependencies | TypeScript 6.0, Biome 2.4 updates | Medium | 30min | No |
| Features | No webhook verification | Medium | 2-3h | No |
| Features | No retry utilities | Low | 1-2h | No |
| Features | No logging hooks | Low | 1h | No |
| Testing | Error scenarios for query methods | Medium | 1-2h | No |
| Docs | Rate limiting guidance | Low | 30min | No |

---

*Concerns audit: 2026-03-24*
