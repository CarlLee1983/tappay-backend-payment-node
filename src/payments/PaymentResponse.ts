import type { CardInfo, CardSecret } from '../domain/CardInfo'
import type { Currency } from '../enums/Currency'

/**
 * Base TapPay API Response
 */
export interface TapPayBaseResponse {
  /**
   * Status code (0 = success)
   */
  status: number

  /**
   * Status message
   */
  msg: string
}

/**
 * Pay by Prime / Pay by Token API Response
 */
export interface PaymentResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID (must be stored for refund/query)
   */
  rec_trade_id: string

  /**
   * Bank transaction ID
   */
  bank_transaction_id: string

  /**
   * Bank order number from acquirer
   */
  bank_order_number?: string

  /**
   * Authorization code (Direct Pay / Token Pay)
   */
  auth_code?: string

  /**
   * Transaction amount
   */
  amount: number

  /**
   * Currency code
   */
  currency: Currency

  /**
   * Card information
   */
  card_info?: CardInfo

  /**
   * Card secret (when remember=true)
   */
  card_secret?: CardSecret

  /**
   * Bank ID
   */
  bank_id?: string

  /**
   * Order number
   */
  order_number?: string

  /**
   * Acquirer name
   */
  acquirer?: string

  /**
   * Transaction time (milliseconds)
   */
  transaction_time_millis?: number

  /**
   * Bank transaction time
   */
  bank_transaction_time?: {
    start_time_millis?: number
    end_time_millis?: number
  }

  /**
   * Extra info (e.g., redeem info)
   */
  extra_info?: Record<string, unknown>

  /**
   * Payment URL for 3D/e-payment (redirect user here)
   */
  payment_url?: string
}

/**
 * Refund API Response
 */
export interface RefundResponse extends TapPayBaseResponse {
  /**
   * TapPay refund ID
   */
  refund_id?: string

  /**
   * Bank refund order number
   */
  bank_refund_order_number?: string

  /**
   * Refund amount
   */
  refund_amount?: number

  /**
   * Currency
   */
  currency?: Currency

  /**
   * Whether the original transaction was captured
   */
  is_captured?: boolean
}

/**
 * Cap Today API Response
 */
export interface CapTodayResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID
   */
  rec_trade_id?: string
}

/**
 * Cap Cancel API Response
 */
export interface CapCancelResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID
   */
  rec_trade_id?: string
}

/**
 * Refund Cancel API Response
 */
export interface RefundCancelResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID
   */
  rec_trade_id?: string

  /**
   * Refund ID that was cancelled
   */
  refund_id?: string
}

/**
 * Bind Card API Response
 */
export interface BindCardResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID
   */
  rec_trade_id?: string

  /**
   * Card secret for future payments
   */
  card_secret?: CardSecret

  /**
   * Card information
   */
  card_info?: CardInfo

  /**
   * Payment URL for 3D verification
   */
  payment_url?: string
}

/**
 * Remove Card API Response
 */
export interface RemoveCardResponse extends TapPayBaseResponse {
  /**
   * Card key that was removed
   */
  card_key?: string

  /**
   * Card token that was removed
   */
  card_token?: string
}

/**
 * Trade History Event
 */
export interface TradeHistoryEvent {
  /**
   * Event type (e.g., "AUTH", "CAPTURE", "REFUND")
   */
  event_type?: string

  /**
   * Event time (milliseconds)
   */
  time?: number

  /**
   * Event status
   */
  status?: number

  /**
   * Event message
   */
  msg?: string

  /**
   * Amount involved in this event
   */
  amount?: number
}

/**
 * Trade History API Response
 */
export interface TradeHistoryResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID
   */
  rec_trade_id?: string

  /**
   * Transaction amount
   */
  amount?: number

  /**
   * Currency
   */
  currency?: Currency

  /**
   * Order number
   */
  order_number?: string

  /**
   * Bank transaction ID
   */
  bank_transaction_id?: string

  /**
   * Card information
   */
  card_info?: CardInfo

  /**
   * Transaction events history
   */
  trade_history?: TradeHistoryEvent[]

  /**
   * Whether transaction is captured
   */
  is_captured?: boolean

  /**
   * Current transaction status
   */
  record_status?: number
}

/**
 * Trade Record
 */
export interface TradeRecord {
  /**
   * TapPay transaction ID
   */
  rec_trade_id: string

  /**
   * Transaction status (0 = success)
   */
  status: number

  /**
   * Transaction amount
   */
  amount: number

  /**
   * Currency
   */
  currency?: Currency

  /**
   * Order number
   */
  order_number?: string

  /**
   * Bank transaction ID
   */
  bank_transaction_id?: string

  /**
   * Merchant ID
   */
  merchant_id?: string

  /**
   * Transaction time
   */
  time?: number

  /**
   * Card information
   */
  card_info?: CardInfo

  /**
   * Cardholder name
   */
  cardholder_name?: string

  /**
   * Cardholder email
   */
  cardholder_email?: string

  /**
   * Cardholder phone
   */
  cardholder_phone_number?: string

  /**
   * Is captured
   */
  is_captured?: boolean

  /**
   * Capture time
   */
  cap_millis?: number

  /**
   * Refund info
   */
  refund_records?: RefundRecord[]
}

/**
 * Refund Record
 */
export interface RefundRecord {
  /**
   * Refund ID
   */
  refund_id: string

  /**
   * Refund amount
   */
  amount: number

  /**
   * Refund time
   */
  time?: number
}

/**
 * Record API Response
 */
export interface RecordResponse extends TapPayBaseResponse {
  /**
   * Records per page
   */
  records_per_page?: number

  /**
   * Current page
   */
  page?: number

  /**
   * Total page count
   */
  total_page_count?: number

  /**
   * Total number of transactions
   */
  number_of_transactions?: number

  /**
   * Trade records
   */
  trade_records?: TradeRecord[]
}

/**
 * Backend Notify Request Body
 * Sent by TapPay to backend_notify_url
 */
export interface BackendNotifyPayload {
  /**
   * TapPay transaction ID
   */
  rec_trade_id: string

  /**
   * Bank transaction ID
   */
  bank_transaction_id?: string

  /**
   * Bank order number
   */
  bank_order_number?: string

  /**
   * Order number
   */
  order_number?: string

  /**
   * Transaction amount
   */
  amount: number

  /**
   * Transaction status (0 = success)
   */
  status: number

  /**
   * Status message
   */
  msg: string

  /**
   * Transaction time (ms)
   */
  transaction_time_millis?: number

  /**
   * Transaction complete time (ms)
   */
  transaction_complete_millis?: number

  /**
   * E-payment info
   */
  pay_info?: {
    method?: string
    masked_credit_card_number?: string
    point?: number
  }

  /**
   * Card information
   */
  card_info?: CardInfo

  /**
   * Currency
   */
  currency?: Currency

  /**
   * Authorization code
   */
  auth_code?: string
}
