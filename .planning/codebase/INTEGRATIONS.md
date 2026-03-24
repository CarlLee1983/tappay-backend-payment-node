# External Integrations

**Analysis Date:** 2026-03-24

## APIs & External Services

**TapPay Payment Gateway:**
- TapPay Backend Payment API
  - SDK/Client: `TapPayClient` class (`src/TapPayClient.ts`)
  - Auth: Partner Key via `x-api-key` header
  - Endpoints:
    - `/tpc/payment/pay-by-prime` - Process payment with Prime token
    - `/tpc/payment/pay-by-token` - Process payment with saved card token
    - `/tpc/transaction/refund` - Refund transaction
    - `/tpc/transaction/refund/cancel` - Cancel pending refund
    - `/tpc/transaction/cap` - Capture delayed payment
    - `/tpc/transaction/cap/cancel` - Cancel pending capture
    - `/tpc/card/bind` - Bind card for future payments
    - `/tpc/card/remove` - Remove bound card
    - `/tpc/transaction/query` - Query transaction records
    - `/tpc/transaction/trade-history` - Get transaction history

**Payment Methods Supported:**
- Credit/Debit Cards (Visa, Mastercard, etc.)
- 3D Secure (3DS) verification
- Apple Pay
- Google Pay
- LINE Pay
- JKOPay
- Installment payments (supported by some acquirers)

## Data Storage

**Databases:**
- Not applicable - This is a client SDK, not a backend service
- Card tokens stored server-side on TapPay platform only
- No local persistence layer

**File Storage:**
- Not applicable

**Caching:**
- None configured in SDK
- Applications consuming SDK may implement caching

## Authentication & Identity

**Auth Provider:**
- TapPay Portal credentials
- Implementation: API Key-based authentication

**Required Credentials:**
- `partnerKey` - Obtained from TapPay Portal (merchant account)
- `merchantId` - Obtained from TapPay Portal (merchant account)

**Credential Management:**
- Passed to `TapPayClient` constructor
- partnerKey sent in `x-api-key` header for each request
- Both credentials included in request body for API compatibility

## Monitoring & Observability

**Error Tracking:**
- Not built-in - Applications must implement their own error tracking
- SDK provides typed error classes for error handling:
  - `TapPayError` - API response errors
  - `TapPayValidationError` - Input validation errors
  - `TapPayConfigError` - Configuration errors
  - `TapPayTimeoutError` - Request timeout errors

**Logs:**
- No built-in logging
- Applications should implement logging at consumption layer
- Error messages from API responses are captured in error objects

## CI/CD & Deployment

**Hosting:**
- NPM Registry (https://registry.npmjs.org/)
- GitHub Repository (https://github.com/CarlLee1983/tappay-backend-payment-node)

**CI Pipeline:**
- GitHub Actions (`.github/workflows/ci.yml`)
- Triggers: Push to main, Pull requests to main
- Steps:
  1. Checkout code
  2. Setup Bun (latest)
  3. Install dependencies with frozen lockfile
  4. Run linter (`bun run check`)
  5. Run typecheck (`bun run typecheck`)
  6. Run tests with coverage (`bun run test:ci`)
  7. Build distribution (`bun run build`)
  8. Verify build outputs (ESM, CJS, types)

**Release Pipeline:**
- Release Please (`.github/workflows/release-please.yml`)
- Automated versioning and changelog generation
- Publishes to NPM automatically on version bump

## Environment Configuration

**Required env vars:**
- None required by SDK itself
- Consumer applications must provide:
  - `TAPPAY_PARTNER_KEY` - Partner key (convention, not enforced)
  - `TAPPAY_MERCHANT_ID` - Merchant ID (convention, not enforced)

**Secrets location:**
- Credentials passed programmatically to `TapPayClient` constructor
- Never stored in `.env` files within SDK
- Applications using SDK should manage secrets via environment variables

**Example Configuration:**
```typescript
const client = new TapPayClient({
  partnerKey: process.env.TAPPAY_PARTNER_KEY!,
  merchantId: process.env.TAPPAY_MERCHANT_ID!,
  env: Env.Sandbox,
  timeout: 30000
})
```

## Webhooks & Callbacks

**Incoming:**
- Backend Notify - `BackendNotifyPayload` type defined in `src/payments/PaymentResponse.ts`
- Applications must implement webhook endpoint to receive payment notifications from TapPay
- Webhook format: `POST /api/notify` (example in source documentation)
- No built-in webhook server in SDK

**Outgoing:**
- No outgoing webhooks from SDK
- SDK only sends HTTP requests to TapPay API endpoints
- Applications can invoke TapPayClient methods in response to business events

## API Request/Response Patterns

**Request Structure:**
- All requests: HTTP POST to TapPay API
- Headers:
  - `Content-Type: application/json`
  - `x-api-key: {partnerKey}`
- Body: JSON with merchant credentials + operation-specific parameters
- Timeout: Configurable (default 30000ms) using AbortController

**Response Structure:**
- All responses: JSON
- Base response format:
  ```typescript
  {
    status: number,        // 0 = success, non-zero = error
    msg: string,          // Error message
    rec_trade_id?: string // Transaction ID (if applicable)
    // ... operation-specific fields
  }
  ```

**Error Handling:**
- Non-OK HTTP status triggers `TapPayError` with status code and error message
- Non-zero status in response body triggers `TapPayError` via `fromResponse()`
- Request timeout (AbortError) triggers `TapPayTimeoutError`
- Network errors trigger `TapPayError` with -1 status
- Validation errors trigger `TapPayValidationError` before API call

## API Stability & SLA

**TapPay API Requirements:**
- Status code 0 = success
- Time range filtering limited to 90 days for queries
- Prime token validity: 90 seconds
- Card binding performs automatic $1 TWD test charge + refund
- Refunds/cancellations only work before bank batch processing

**Deprecated Features:**
- None documented in current SDK

---

*Integration audit: 2026-03-24*
