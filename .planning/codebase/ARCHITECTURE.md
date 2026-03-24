# Architecture

**Analysis Date:** 2026-03-24

## Pattern Overview

**Overall:** SDK Client Pattern with Domain-Driven Design

This is a single-entry-point SDK that wraps the TapPay Backend Payment API. The architecture follows a client-centric design where all domain logic, validation, and error handling are encapsulated within a primary `TapPayClient` class.

**Key Characteristics:**
- Single responsibility: `TapPayClient` provides all payment API interactions
- Type-first design: Heavy use of TypeScript interfaces for request/response contracts
- Input validation at method level: Each public method validates its own inputs before API calls
- Error hierarchy: Domain-specific error classes for different failure scenarios
- Configuration immutability: Client config is locked after construction

## Layers

**Configuration Layer:**
- Purpose: Manages client initialization and configuration validation
- Location: `src/config/`
- Contains: `TapPayConfig` interface, `Env` endpoints, environment constants
- Depends on: Nothing (pure configuration)
- Used by: `TapPayClient` constructor

**Domain Layer:**
- Purpose: Defines core business entities and value objects
- Location: `src/domain/`
- Contains: `Cardholder`, `CardInfo`, `CardSecret`, `ResultUrl` interfaces
- Depends on: `Enums` (for types like `CardType`)
- Used by: Request/Response types, API method parameters

**Enum Layer:**
- Purpose: Centralized constants for currencies, card types
- Location: `src/enums/`
- Contains: `Currency` with `CurrencyMultiplier`, `CardType`
- Depends on: Nothing
- Used by: Domain layer, response types

**Error Layer:**
- Purpose: Domain-specific error classes for different failure modes
- Location: `src/errors/`
- Contains: `TapPayError`, `TapPayConfigError`, `TapPayValidationError`, `TapPayTimeoutError`
- Depends on: Nothing
- Used by: `TapPayClient` for error handling and propagation

**API Request/Response Layer:**
- Purpose: Type definitions for all TapPay API contracts
- Location: `src/payments/`
- Contains: `PayByPrimeRequest`, `PayByTokenRequest`, `RefundRequest`, `PaymentResponse`, etc.
- Depends on: Domain layer, Enum layer
- Used by: `TapPayClient` methods

**Client Layer:**
- Purpose: Primary public interface for SDK consumers
- Location: `src/TapPayClient.ts`
- Contains: Main `TapPayClient` class with all API methods
- Depends on: All other layers
- Used by: External SDK consumers

## Data Flow

**Payment Processing Flow (Pay by Prime):**

1. User calls `client.payByPrime(options)`
2. Method validates inputs using built-in checks:
   - Prime must be non-empty string
   - Amount must be positive
   - Order number if provided cannot be empty
3. Constructs `PayByPrimeRequest` object with config fields (`partner_key`, `merchant_id`)
4. Calls private `sendRequest<PaymentResponse>()` method
5. `sendRequest` constructs HTTP POST to `/tpc/payment/pay-by-prime` endpoint
6. Sets up AbortController timeout (default 30s)
7. Adds headers: `Content-Type: application/json`, `x-api-key: partnerKey`
8. Handles response:
   - HTTP error → Convert to `TapPayError` with extracted message
   - Parse JSON → Handle parse errors with `TapPayError`
   - Check status code → If not 0, throw `TapPayError`
9. Returns typed `PaymentResponse` object
10. Caller can access `rec_trade_id`, `card_info`, `card_secret` (if remember=true)

**Card Token Payment Flow (Pay by Token):**

1. User calls `client.payByToken(options)` with stored `card_key`, `card_token`
2. Method validates:
   - Card key required and non-empty
   - Card token required and non-empty
   - Amount positive
   - Currency provided
3. Constructs `PayByTokenRequest` and sends to `/tpc/payment/pay-by-token`
4. Same error handling and response processing as Pay by Prime

**Transaction Management Flow (Refund):**

1. User calls `client.refund(recTradeId, options?)`
2. Validates trade ID is non-empty
3. Validates amount if provided (must be positive)
4. Sends `RefundRequest` to `/tpc/transaction/refund`
5. Returns `RefundResponse` with refund details

**Query Flow (Get Transaction):**

1. User calls `client.getTransaction(recTradeId)` or `client.getRecords(options)`
2. Constructs `RecordRequest` with filters/pagination
3. Sends to `/tpc/transaction/query`
4. Returns `RecordResponse` with array of trade records or single record

**State Management:**
- Client config is immutable after construction (stored as `readonly`)
- No internal state changes during API calls (functional approach)
- Each request is independent (no session/state dependencies)
- Timeout is per-request via AbortController (not stored in client)

## Key Abstractions

**TapPayClient:**
- Purpose: Single entry point for all SDK operations
- Examples: `src/TapPayClient.ts`
- Pattern: Facade pattern - presents unified interface to complex backend API

**Request Objects:**
- Purpose: Type-safe request payloads for each API endpoint
- Examples: `PayByPrimeRequest`, `PayByTokenRequest`, `RefundRequest`
- Pattern: Data Transfer Objects (DTOs) - encapsulate API contract

**Response Objects:**
- Purpose: Type-safe response payloads from TapPay API
- Examples: `PaymentResponse`, `RefundResponse`, `RecordResponse`
- Pattern: DTOs mirroring API responses with proper type definitions

**Error Hierarchy:**
- Purpose: Distinguishes between different failure modes
- Examples: `TapPayConfigError` (init failure), `TapPayValidationError` (input failure), `TapPayError` (API failure), `TapPayTimeoutError` (timeout)
- Pattern: Inheritance-based exception hierarchy for granular error handling

**Domain Types:**
- Purpose: Represent business entities
- Examples: `Cardholder`, `CardInfo`, `CardSecret`
- Pattern: Value objects - immutable, semantic types

## Entry Points

**TapPayClient Constructor:**
- Location: `src/TapPayClient.ts` lines 81-90
- Triggers: Manual instantiation by SDK consumer
- Responsibilities:
  - Validate config (partner key, merchant ID, timeout)
  - Store config in immutable form
  - Throw `TapPayConfigError` if validation fails

**Public API Methods:**
- Locations: `src/TapPayClient.ts` lines 256-707
- Methods:
  - `payByPrime()` - lines 256-283
  - `payByToken()` - lines 308-343
  - `refund()` - lines 371-395
  - `cancelRefund()` - lines 415-435
  - `capToday()` - lines 454-469
  - `cancelCapture()` - lines 487-502
  - `bindCard()` - lines 538-560
  - `removeCard()` - lines 579-599
  - `getRecords()` - lines 627-637
  - `getTransaction()` - lines 658-671
  - `getTradeHistory()` - lines 692-707
- Responsibilities: Input validation, request construction, delegation to `sendRequest()`

**sendRequest() Private Method:**
- Location: `src/TapPayClient.ts` lines 128-222
- Triggers: Called by all public API methods
- Responsibilities:
  - Construct HTTP request with proper headers
  - Handle timeout via AbortController
  - Parse JSON response
  - Extract meaningful error messages
  - Convert HTTP/parse errors to domain errors
  - Validate TapPay status code

## Error Handling

**Strategy:** Multi-layered error handling with explicit error types

**Patterns:**

1. **Configuration Validation:**
   - When: During `TapPayClient` constructor
   - How: Check required fields (partnerKey, merchantId), validate timeout > 0
   - Throws: `TapPayConfigError` with field name

2. **Input Validation:**
   - When: At start of each public method
   - How: Check required fields non-empty, amounts positive, enums valid
   - Throws: `TapPayValidationError` with field name

3. **Network Error Handling:**
   - When: During fetch() or response parsing
   - How: Catch errors, convert to `TapPayError` with descriptive message
   - Includes: HTTP status codes, parse errors, network errors

4. **Timeout Handling:**
   - When: AbortController timeout triggers
   - How: Detect AbortError, convert to `TapPayTimeoutError` with endpoint/timeout details
   - Throws: `TapPayTimeoutError` extends `TapPayError`

5. **API Status Code Validation:**
   - When: After successful HTTP response
   - How: Check response.status === 0, extract msg/rec_trade_id from response
   - Throws: `TapPayError` created via `TapPayError.fromResponse()`

## Cross-Cutting Concerns

**Logging:**
- No built-in logging; SDK is silent by default
- Error messages are provided in exception messages for caller logging
- Recommendation: Caller should wrap SDK calls with logging middleware

**Validation:**
- Input validation at method entry (before API call)
- Type safety via TypeScript interfaces
- No runtime schema validation (simple string/number checks only)

**Authentication:**
- API key passed in `x-api-key` header on every request
- No session management (stateless)
- Credentials embedded in every request for simplicity

**Timeout Control:**
- Per-request timeout via AbortController
- Default 30 seconds (configurable per client)
- Applied to entire fetch operation including response parsing

**Immutability:**
- Client config locked after construction
- No internal state mutations during API calls
- Responses are plain objects (mutable by caller)

---

*Architecture analysis: 2026-03-24*
