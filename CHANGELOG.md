# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0](https://github.com/CarlLee1983/tappay-backend-payment-node/compare/v1.4.0...v1.5.0) (2025-12-12)


### Features

* 加上增強控制版本管理 ([eca0f6a](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/eca0f6aee269ca68a870a7c6ec7662ced0a14e49))

## [1.4.0](https://github.com/CarlLee1983/tappay-backend-payment-node/compare/v1.3.0...v1.4.0) (2025-12-12)


### Features

* 更新套件名稱以匹配 GitHub repository ([f288fba](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/f288fba1a6b583dbdfa8326b43babb5277ca3713))

## [1.3.0](https://github.com/CarlLee1983/tappay-backend-payment-node/compare/v1.2.0...v1.3.0) (2025-12-12)


### Features

* 將套件名稱更新為 scoped package ([ae5f3f0](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/ae5f3f0b5fbfd5222e00c62e399a8184bbcc21bc))

## [1.2.0](https://github.com/CarlLee1983/tappay-backend-payment-node/compare/v1.1.0...v1.2.0) (2025-12-12)


### Features

* 新增發布檢查清單文件 ([5491f55](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/5491f551cdba4e9af09e5406f28b6be44dfc9b29))

## [1.1.1](https://github.com/CarlLee1983/tappay-backend-payment-node/compare/v1.1.0...v1.1.1) (2025-12-12)


### Chores

* 更新 package.json 中的 repository URL 並改進 GitHub Actions 工作流程 ([642078c](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/642078c))
* 清理 CHANGELOG 中已發布的內容 ([509ca3a](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/509ca3a))

## [1.1.0](https://github.com/CarlLee1983/tappay-backend-payment-node/compare/v1.0.0...v1.1.0) (2025-12-12)


### Features

* 新增輸入驗證功能並改進錯誤處理 ([6c0c18b](https://github.com/CarlLee1983/tappay-backend-payment-node/commit/6c0c18b4e84054c65dfca9438d20f8df611dd7d2))

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
