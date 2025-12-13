import type { CardInfo, CardSecret } from '../domain/CardInfo'
import type { Currency } from '../enums/Currency'

/**
 * TapPay API 基礎回應
 *
 * 所有 TapPay API 回應的基礎介面。
 */
export interface TapPayBaseResponse {
  /**
   * 狀態碼（0 表示成功，其他值表示錯誤）
   */
  status: number

  /**
   * 狀態訊息
   */
  msg: string
}

/**
 * Pay by Prime / Pay by Token API 回應
 *
 * 使用 Prime Token 或 Card Token 付款時的回應。
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
 * 退款 API 回應
 *
 * 處理退款時的回應。
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
 * 立即請款 API 回應
 *
 * 執行立即請款時的回應。
 */
export interface CapTodayResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID
   */
  rec_trade_id?: string
}

/**
 * 取消請款 API 回應
 *
 * 取消請款時的回應。
 */
export interface CapCancelResponse extends TapPayBaseResponse {
  /**
   * TapPay transaction ID
   */
  rec_trade_id?: string
}

/**
 * 取消退款 API 回應
 *
 * 取消退款時的回應。
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
 * 綁定卡片 API 回應
 *
 * 綁定卡片時的回應，包含 card_secret 以供未來使用。
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
 * 移除卡片 API 回應
 *
 * 移除已綁定卡片時的回應。
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
 * 交易歷史事件
 *
 * 代表交易歷史中的單一事件（例如：授權、請款、退款等）。
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
 * 交易歷史 API 回應
 *
 * 取得交易歷史記錄時的回應，包含所有交易事件。
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
 * 交易記錄
 *
 * 代表單筆交易記錄，包含交易的所有相關資訊。
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
 * 退款記錄
 *
 * 代表單筆退款記錄。
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
 * 查詢記錄 API 回應
 *
 * 查詢交易記錄時的回應，包含分頁資訊和交易記錄列表。
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
 * 後端通知請求主體
 *
 * TapPay 發送到 backend_notify_url 的請求主體。
 * 用於 3D Secure 和電子支付的異步通知。
 *
 * @example
 * ```typescript
 * // Express.js 範例
 * app.post('/api/notify', (req, res) => {
 *   const payload: BackendNotifyPayload = req.body
 *   if (payload.status === 0) {
 *     console.log(`交易成功: ${payload.rec_trade_id}`)
 *   }
 *   res.status(200).send('OK')
 * })
 * ```
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
