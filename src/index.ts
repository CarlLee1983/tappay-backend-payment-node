/**
 * TapPay 後端付款 SDK for Node.js
 *
 * 一個完整的 TypeScript SDK，用於與 TapPay 後端付款 API 互動。
 * 提供完整的類型支援、錯誤處理和輸入驗證。
 *
 * @module @carllee1983/tappay-backend-payment-node
 * @see {@link https://docs.tappaysdk.com/tutorial/zh/back.html TapPay 官方文件}
 *
 * @example
 * ```typescript
 * import { TapPayClient, Env, Currency } from '@carllee1983/tappay-backend-payment-node'
 *
 * const client = new TapPayClient({
 *   partnerKey: 'your_partner_key',
 *   merchantId: 'your_merchant_id',
 *   env: Env.Sandbox
 * })
 *
 * const response = await client.payByPrime({
 *   prime: 'prime_from_frontend',
 *   amount: 100,
 *   currency: Currency.TWD,
 *   details: 'Test Payment'
 * })
 * ```
 */

// Export version from package.json
import packageJson from '../package.json'

/**
 * SDK 版本號
 *
 * 從 package.json 自動匯出的版本號。
 *
 * @example
 * ```typescript
 * import { VERSION } from '@carllee1983/tappay-backend-payment-node'
 * console.log(`SDK Version: ${VERSION}`)
 * ```
 */
export const VERSION = packageJson.version

// ============================================================================
// Configuration
// ============================================================================
export { Env } from './config/Env'
export type { TapPayConfig } from './config/TapPayConfig'
export type { Cardholder } from './domain/Cardholder'
// ============================================================================
// Domain Types
// ============================================================================
export type { CardInfo, CardSecret } from './domain/CardInfo'
export type { ResultUrl } from './domain/ResultUrl'

// ============================================================================
// Enums
// ============================================================================
export { CardType, getCardTypeName } from './enums/CardType'
export { Currency, CurrencyMultiplier } from './enums/Currency'

// ============================================================================
// Errors
// ============================================================================
export { TapPayConfigError } from './errors/TapPayConfigError'
export { TapPayError } from './errors/TapPayError'
export { TapPayTimeoutError } from './errors/TapPayTimeoutError'
export { TapPayValidationError } from './errors/TapPayValidationError'

// ============================================================================
// Request Types
// ============================================================================
export type {
  BindCardRequest,
  CapCancelRequest,
  CapTodayRequest,
  PayByPrimeRequest,
  PayByTokenRequest,
  RecordFilters,
  RecordOrder,
  RecordRequest,
  RefundCancelRequest,
  RefundRequest,
  RemoveCardRequest,
  TradeHistoryRequest,
} from './payments/PaymentRequest'

// ============================================================================
// Response Types
// ============================================================================
export type {
  BackendNotifyPayload,
  BindCardResponse,
  CapCancelResponse,
  CapTodayResponse,
  PaymentResponse,
  RecordResponse,
  RefundCancelResponse,
  RefundRecord,
  RefundResponse,
  RemoveCardResponse,
  TapPayBaseResponse,
  TradeHistoryEvent,
  TradeHistoryResponse,
  TradeRecord,
} from './payments/PaymentResponse'

// ============================================================================
// Service classes (new in v1.8.0)
// ============================================================================
export { BaseService } from './services/BaseService'
export { CardService } from './services/CardService'
export { PaymentService } from './services/PaymentService'
export { TransactionService } from './services/TransactionService'
// ============================================================================
// Core Client
// ============================================================================
export { TapPayClient } from './TapPayClient'
// ============================================================================
// Utility functions (new in v1.8.0)
// ============================================================================
export { isRetryableError, scrubErrorForLogging } from './utils/errorHandling'
export { type RetryOptions, retryWithBackoff } from './utils/retry'
export {
  generateWebhookSignature,
  verifyTapPayWebhook,
} from './utils/webhooks'
