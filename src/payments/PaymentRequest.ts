import type { Cardholder } from '../domain/Cardholder'
import type { ResultUrl } from '../domain/ResultUrl'
import type { Currency } from '../enums/Currency'

/**
 * Pay by Prime API 請求
 *
 * 使用 Prime Token 付款的請求介面。
 * API 端點：POST /tpc/payment/pay-by-prime
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
 * Pay by Card Token API 請求
 *
 * 使用卡片 Token 付款的請求介面。
 * API 端點：POST /tpc/payment/pay-by-token
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
 * 退款 API 請求
 *
 * 處理退款的請求介面。
 * API 端點：POST /tpc/transaction/refund
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
 * 立即請款 API 請求
 *
 * 立即請款交易的請求介面（當日）。
 * API 端點：POST /tpc/transaction/cap
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
 * 取消請款 API 請求
 *
 * 在銀行批次處理前取消待處理請款的請求介面。
 * API 端點：POST /tpc/transaction/cap/cancel
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
 * 取消退款 API 請求
 *
 * 在銀行批次處理前取消待處理退款的請求介面。
 * 目前僅支援台新銀行。
 * API 端點：POST /tpc/transaction/refund/cancel
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
 * 綁定卡片 API 請求
 *
 * 綁定卡片以供未來 token 付款使用的請求介面。
 * API 端點：POST /tpc/card/bind
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
 * 移除卡片 API 請求
 *
 * 從 TapPay 伺服器移除已綁定卡片的請求介面。
 * API 端點：POST /tpc/card/remove
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
 * 交易歷史 API 請求
 *
 * 取得詳細交易歷史記錄的請求介面。
 * API 端點：POST /tpc/transaction/trade-history
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
 * 記錄查詢篩選條件
 *
 * 用於查詢交易記錄時的篩選條件。
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
 * 記錄查詢排序
 *
 * 用於查詢交易記錄時的排序設定。
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
 * 查詢記錄 API 請求
 *
 * 查詢交易記錄的請求介面，支援篩選、分頁和排序。
 * API 端點：POST /tpc/transaction/query
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
