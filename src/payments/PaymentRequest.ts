import type { Cardholder } from '../domain/Cardholder'
import type { ResultUrl } from '../domain/ResultUrl'
import type { Currency } from '../enums/Currency'

/**
 * Pay by Prime API Request
 * POST /tpc/payment/pay-by-prime
 */
export interface PayByPrimeRequest {
  /**
   * Prime token from frontend SDK (valid for 90 seconds)
   */
  prime: string

  /**
   * Partner Key from TapPay Portal
   * Note: Also sent in x-api-key header
   */
  partner_key: string

  /**
   * Merchant ID
   */
  merchant_id: string

  /**
   * Transaction amount
   * For non-TWD currencies, multiply by 100
   */
  amount: number

  /**
   * Currency code (ISO 4217)
   * @default "TWD"
   */
  currency?: Currency

  /**
   * Order number (merchant's reference)
   * Can be duplicated but cannot be empty string
   */
  order_number?: string

  /**
   * Bank transaction ID
   * Recommended to be unique, used for timeout recovery
   */
  bank_transaction_id?: string

  /**
   * Transaction details/description
   * Required by some acquirers for PCI compliance
   */
  details?: string

  /**
   * Cardholder information
   * Used for fraud detection and 3D Secure
   */
  cardholder?: Cardholder

  /**
   * Enable 3D Secure verification
   * @default false
   */
  three_domain_secure?: boolean

  /**
   * Result URLs for 3D/e-payment transactions
   */
  result_url?: ResultUrl

  /**
   * Remember card for future transactions
   * If true, returns card_key and card_token
   * @default false
   */
  remember?: boolean

  /**
   * Installment periods (Direct Pay only, supported by some acquirers)
   */
  instalment?: number

  /**
   * Days to delay capture after authorization
   * 0 = same day, -1 = no capture
   */
  delay_capture_in_days?: number

  /**
   * Product image URL for e-payment display
   */
  product_image_url?: string
}

/**
 * Pay by Card Token API Request
 * POST /tpc/payment/pay-by-token
 */
export interface PayByTokenRequest {
  /**
   * Card key from previous Pay by Prime with remember=true
   */
  card_key: string

  /**
   * Card token from previous Pay by Prime with remember=true
   */
  card_token: string

  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * Merchant ID
   */
  merchant_id: string

  /**
   * Transaction amount
   */
  amount: number

  /**
   * Currency code (ISO 4217)
   */
  currency: Currency

  /**
   * Order number
   */
  order_number?: string

  /**
   * Bank transaction ID
   */
  bank_transaction_id?: string

  /**
   * Transaction details
   */
  details?: string

  /**
   * Cardholder information
   */
  cardholder?: Cardholder

  /**
   * Enable 3D Secure
   */
  three_domain_secure?: boolean

  /**
   * Result URLs
   */
  result_url?: ResultUrl

  /**
   * Installment periods
   */
  instalment?: number

  /**
   * Days to delay capture
   */
  delay_capture_in_days?: number
}

/**
 * Refund API Request
 * POST /tpc/transaction/refund
 */
export interface RefundRequest {
  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * TapPay transaction ID to refund
   */
  rec_trade_id: string

  /**
   * Refund amount (optional - omit for full refund)
   */
  amount?: number

  /**
   * Merchant's refund reference ID (must be unique)
   */
  bank_refund_id?: string
}

/**
 * Cap Today API Request
 * POST /tpc/transaction/cap
 * Capture a transaction immediately (same day)
 */
export interface CapTodayRequest {
  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * TapPay transaction ID to capture
   */
  rec_trade_id: string
}

/**
 * Cap Cancel API Request
 * POST /tpc/transaction/cap/cancel
 * Cancel a pending capture before bank batch processing
 */
export interface CapCancelRequest {
  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * TapPay transaction ID
   */
  rec_trade_id: string
}

/**
 * Refund Cancel API Request
 * POST /tpc/transaction/refund/cancel
 * Cancel a pending refund before bank batch processing
 * Currently only supported by Taishin Bank
 */
export interface RefundCancelRequest {
  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * TapPay transaction ID
   */
  rec_trade_id: string

  /**
   * Refund ID to cancel
   */
  refund_id: string
}

/**
 * Bind Card API Request
 * POST /tpc/card/bind
 * Bind a card for future token-based payments
 */
export interface BindCardRequest {
  /**
   * Prime token from frontend SDK
   */
  prime: string

  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * Merchant ID
   */
  merchant_id: string

  /**
   * Currency code (ISO 4217)
   */
  currency: Currency

  /**
   * Cardholder information
   */
  cardholder?: Cardholder

  /**
   * Result URLs for 3D transactions
   */
  result_url?: ResultUrl

  /**
   * Transaction details
   */
  details?: string
}

/**
 * Remove Card API Request
 * POST /tpc/card/remove
 * Remove a bound card from TapPay servers
 */
export interface RemoveCardRequest {
  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * Card key to remove
   */
  card_key: string

  /**
   * Card token to remove
   */
  card_token: string
}

/**
 * Trade History API Request
 * POST /tpc/transaction/trade-history
 * Get detailed transaction history
 */
export interface TradeHistoryRequest {
  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * TapPay transaction ID
   */
  rec_trade_id: string
}

/**
 * Record Query Filters
 */
export interface RecordFilters {
  /**
   * Time range filter
   */
  time?: {
    start_time?: number
    end_time?: number
  }

  /**
   * Amount range filter
   */
  amount?: {
    upper_limit?: number
    lower_limit?: number
  }

  /**
   * Cardholder filter
   */
  cardholder?: Cardholder

  /**
   * Merchant ID filter
   */
  merchant_id?: string

  /**
   * TapPay transaction ID filter
   */
  rec_trade_id?: string

  /**
   * Order number filter
   */
  order_number?: string

  /**
   * Bank transaction ID filter
   */
  bank_transaction_id?: string

  /**
   * Currency filter
   */
  currency?: Currency
}

/**
 * Record Query Order
 */
export interface RecordOrder {
  /**
   * Field to order by
   */
  attribute: 'time' | 'amount'

  /**
   * Descending order
   */
  is_descending?: boolean
}

/**
 * Record API Request
 * POST /tpc/transaction/query
 */
export interface RecordRequest {
  /**
   * Partner Key from TapPay Portal
   */
  partner_key: string

  /**
   * Records per page (max 200)
   * @default 50
   */
  records_per_page?: number

  /**
   * Page number (0-indexed)
   * @default 0
   */
  page?: number

  /**
   * Query filters
   */
  filters?: RecordFilters

  /**
   * Sort order
   */
  order_by?: RecordOrder
}
