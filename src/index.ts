/**
 * TapPay Backend Payment SDK for Node.js
 *
 * A TypeScript SDK for TapPay Backend Payment APIs.
 *
 * @module tappay-backend-payment
 * @see https://docs.tappaysdk.com/tutorial/zh/back.html
 */

// Export version from package.json
import packageJson from '../package.json'

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
// Core Client
// ============================================================================
export { TapPayClient } from './TapPayClient'
