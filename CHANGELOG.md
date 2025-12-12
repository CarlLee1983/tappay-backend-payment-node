# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2025-12-12)


### Features

* add changelog sections configuration to release-please ([9e836ff](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/9e836ffc7a9b97eb748da2ce2b1f48999029c361))
* initial release of TapPay Backend Payment SDK ([a144a81](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/a144a8142a7369389e4a82c821a80d52a3d5b4fb))

## [Unreleased]

## [1.0.0] - 2024-12-12

### Added

- **TapPayClient** - Core client class for TapPay Backend Payment APIs
- **Payment APIs**
  - `payByPrime()` - Process payment using prime token from frontend
  - `payByToken()` - Process payment using saved card credentials
- **Transaction Management**
  - `refund()` - Process full or partial refunds
  - `cancelRefund()` - Cancel pending refunds (Taishin Bank only)
  - `capToday()` - Capture delayed transactions immediately
  - `cancelCapture()` - Cancel pending captures
- **Card Management**
  - `bindCard()` - Bind card for future token-based payments
  - `removeCard()` - Remove bound cards from TapPay servers
- **Query APIs**
  - `getRecords()` - Query transaction records with filtering and pagination
  - `getTransaction()` - Get single transaction by ID
  - `getTradeHistory()` - Get detailed transaction history
- **Error Handling**
  - `TapPayError` - Base error for API responses
  - `TapPayConfigError` - Configuration errors
  - `TapPayTimeoutError` - Request timeout errors
  - `TapPayValidationError` - Validation errors
- **Enums and Types**
  - `Env` - Sandbox and Production environments
  - `Currency` - 13 supported currencies with multipliers
  - `CardType` - Credit, Debit, and Prepaid card types
- Full TypeScript support with comprehensive type definitions
- ES Modules and CommonJS dual package support
- Zero dependencies (uses native fetch API)
- 100% test coverage
