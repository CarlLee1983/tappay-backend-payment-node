import { Env } from './config/Env'
import type { TapPayConfig } from './config/TapPayConfig'
import { TapPayConfigError } from './errors/TapPayConfigError'
import { TapPayError } from './errors/TapPayError'
import { TapPayTimeoutError } from './errors/TapPayTimeoutError'
import { TapPayValidationError } from './errors/TapPayValidationError'
import type {
  BindCardRequest,
  CapCancelRequest,
  CapTodayRequest,
  PayByPrimeRequest,
  PayByTokenRequest,
  RecordRequest,
  RefundCancelRequest,
  RefundRequest,
  RemoveCardRequest,
  TradeHistoryRequest,
} from './payments/PaymentRequest'
import type {
  BindCardResponse,
  CapCancelResponse,
  CapTodayResponse,
  PaymentResponse,
  RecordResponse,
  RefundCancelResponse,
  RefundResponse,
  RemoveCardResponse,
  TapPayBaseResponse,
  TradeHistoryResponse,
} from './payments/PaymentResponse'

/**
 * Default timeout in milliseconds
 * TapPay recommends at least 30 seconds for peak hours
 */
const DEFAULT_TIMEOUT = 30000

/**
 * TapPay 後端付款客戶端
 *
 * 與 TapPay 後端 API 互動的核心類別。
 * 提供付款處理、退款、卡片管理和交易查詢等方法。
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
export class TapPayClient {
  private readonly config: Required<TapPayConfig>

  /**
   * 建立 TapPay 客戶端實例
   *
   * @param config - TapPay 客戶端配置
   * @throws {TapPayConfigError} 當配置無效時（例如：缺少必要欄位、timeout 為負數等）
   *
   * @example
   * ```typescript
   * const client = new TapPayClient({
   *   partnerKey: 'partner_key_from_portal',
   *   merchantId: 'merchant_id_from_portal',
   *   env: Env.Sandbox,
   *   timeout: 30000 // 30 秒
   * })
   * ```
   */
  constructor(config: TapPayConfig) {
    this.validateConfig(config)

    this.config = {
      partnerKey: config.partnerKey,
      merchantId: config.merchantId,
      env: config.env ?? Env.Sandbox,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    }
  }

  /**
   * 驗證客戶端配置
   *
   * 檢查必要的配置欄位是否有效，如果無效則拋出 TapPayConfigError。
   *
   * @param config - TapPay 客戶端配置
   * @throws {TapPayConfigError} 當配置無效時拋出
   * @private
   */
  private validateConfig(config: TapPayConfig): void {
    if (!config.partnerKey || config.partnerKey.trim() === '') {
      throw new TapPayConfigError('Partner Key is required', 'partnerKey')
    }

    if (!config.merchantId || config.merchantId.trim() === '') {
      throw new TapPayConfigError('Merchant ID is required', 'merchantId')
    }

    if (config.timeout !== undefined && config.timeout <= 0) {
      throw new TapPayConfigError('Timeout must be positive', 'timeout')
    }
  }

  /**
   * 發送 HTTP 請求到 TapPay API
   *
   * 處理所有與 TapPay API 的通訊，包括錯誤處理、超時控制和回應解析。
   *
   * @param endpoint - API 端點路徑（例如：'/tpc/payment/pay-by-prime'）
   * @param body - 請求主體物件
   * @returns Promise 解析為 TapPay API 回應
   * @throws {TapPayError} 當 API 回應狀態碼不為 0 時
   * @throws {TapPayTimeoutError} 當請求超時時
   * @throws {TapPayError} 當網路錯誤或回應解析失敗時
   * @private
   */
  private async sendRequest<T extends TapPayBaseResponse>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.env}${endpoint}`

    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.partnerKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      // Handle HTTP errors with better error message extraction
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorText = await response.text()
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText) as { msg?: string; message?: string }
              if (errorData.msg) {
                errorMessage = errorData.msg
              } else if (errorData.message) {
                errorMessage = errorData.message
              }
            } catch {
              // If JSON parsing fails, use the raw text if it's not too long
              if (errorText.length < 500) {
                errorMessage = errorText
              }
            }
          }
        } catch {
          // Ignore errors when reading response, use default message
        }
        throw new TapPayError(errorMessage, response.status)
      }

      // Parse JSON response with error handling
      let data: T
      try {
        const text = await response.text()
        if (!text) {
          throw new TapPayError('Empty response from server', response.status)
        }
        data = JSON.parse(text) as T
      } catch (parseError) {
        throw new TapPayError(
          `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
          response.status
        )
      }

      // Check TapPay status code
      if (data.status !== 0) {
        throw TapPayError.fromResponse(data as TapPayBaseResponse & { rec_trade_id?: string })
      }

      return data
    } catch (error) {
      // Re-throw TapPay errors as-is
      if (error instanceof TapPayError) {
        throw error
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TapPayTimeoutError(
          `Request timeout after ${this.config.timeout}ms`,
          this.config.timeout,
          endpoint
        )
      }

      // Handle other errors with more detailed messages
      const errorMessage =
        error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error occurred'
      throw new TapPayError(`Network error: ${errorMessage}`, -1)
    } finally {
      // Ensure timeout is always cleared
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  // ============================================================================
  // Payment APIs
  // ============================================================================

  /**
   * 使用 Prime Token 付款
   *
   * 使用前端 SDK 產生的 prime token 進行付款。
   * 每個 prime token 只能使用一次，有效期限為 90 秒。
   *
   * @param options - 付款選項（不包含 partner_key 和 merchant_id）
   * @returns Promise 解析為付款回應
   * @throws {TapPayValidationError} 當必要欄位缺失或無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const response = await client.payByPrime({
   *   prime: 'test_prime_123',
   *   amount: 100,
   *   currency: Currency.TWD,
   *   details: 'Test Payment',
   *   cardholder: {
   *     phone_number: '+886912345678',
   *     name: 'Test User',
   *     email: 'test@example.com'
   *   }
   * })
   * console.log(response.rec_trade_id)
   * ```
   */
  async payByPrime(
    options: Omit<PayByPrimeRequest, 'partner_key' | 'merchant_id'>
  ): Promise<PaymentResponse> {
    // Validate required fields
    if (!options.prime || options.prime.trim() === '') {
      throw new TapPayValidationError('Prime is required', 'prime')
    }

    if (options.amount === undefined || options.amount <= 0) {
      throw new TapPayValidationError('Amount must be positive', 'amount')
    }

    // Validate order_number if provided (cannot be empty string)
    if (options.order_number !== undefined && options.order_number.trim() === '') {
      throw new TapPayValidationError('Order number cannot be empty string', 'order_number')
    }

    const body: PayByPrimeRequest = {
      ...options,
      partner_key: this.config.partnerKey,
      merchant_id: this.config.merchantId,
    }

    return this.sendRequest<PaymentResponse>(
      '/tpc/payment/pay-by-prime',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 使用卡片 Token 付款
   *
   * 使用已儲存的卡片憑證進行付款。
   * 需要從之前使用 remember=true 的 Pay by Prime 交易中取得的 card_key 和 card_token。
   *
   * @param options - 付款選項（包含卡片憑證）
   * @returns Promise 解析為付款回應
   * @throws {TapPayValidationError} 當必要欄位缺失或無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const response = await client.payByToken({
   *   card_key: 'saved_card_key',
   *   card_token: 'saved_card_token',
   *   amount: 100,
   *   currency: Currency.TWD,
   *   details: 'Recurring Payment'
   * })
   * ```
   */
  async payByToken(
    options: Omit<PayByTokenRequest, 'partner_key' | 'merchant_id'>
  ): Promise<PaymentResponse> {
    // Validate required fields
    if (!options.card_key || options.card_key.trim() === '') {
      throw new TapPayValidationError('Card key is required', 'card_key')
    }

    if (!options.card_token || options.card_token.trim() === '') {
      throw new TapPayValidationError('Card token is required', 'card_token')
    }

    if (options.amount === undefined || options.amount <= 0) {
      throw new TapPayValidationError('Amount must be positive', 'amount')
    }

    if (!options.currency) {
      throw new TapPayValidationError('Currency is required', 'currency')
    }

    // Validate order_number if provided
    if (options.order_number !== undefined && options.order_number.trim() === '') {
      throw new TapPayValidationError('Order number cannot be empty string', 'order_number')
    }

    const body: PayByTokenRequest = {
      ...options,
      partner_key: this.config.partnerKey,
      merchant_id: this.config.merchantId,
    }

    return this.sendRequest<PaymentResponse>(
      '/tpc/payment/pay-by-token',
      body as unknown as Record<string, unknown>
    )
  }

  // ============================================================================
  // Transaction Management APIs
  // ============================================================================

  /**
   * 退款交易
   *
   * 處理全額或部分退款。
   * 省略 amount 參數則進行全額退款。
   *
   * @param recTradeId - TapPay 交易 ID
   * @param options - 可選的退款選項（amount, bank_refund_id）
   * @returns Promise 解析為退款回應
   * @throws {TapPayValidationError} 當交易 ID 無效或退款金額為負數時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * // 全額退款
   * await client.refund('D20231201123456789')
   *
   * // 部分退款
   * await client.refund('D20231201123456789', { amount: 50 })
   * ```
   */
  async refund(
    recTradeId: string,
    options?: Omit<RefundRequest, 'partner_key' | 'rec_trade_id'>
  ): Promise<RefundResponse> {
    // Validate required fields
    if (!recTradeId || recTradeId.trim() === '') {
      throw new TapPayValidationError('Transaction ID is required', 'recTradeId')
    }

    // Validate amount if provided (must be positive)
    if (options?.amount !== undefined && options.amount <= 0) {
      throw new TapPayValidationError('Refund amount must be positive', 'amount')
    }

    const body: RefundRequest = {
      ...options,
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<RefundResponse>(
      '/tpc/transaction/refund',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 取消退款
   *
   * 在銀行批次處理前取消待處理的退款。
   * 目前僅支援台新銀行。
   *
   * @param recTradeId - TapPay 交易 ID
   * @param refundId - 要取消的退款 ID
   * @returns Promise 解析為取消退款回應
   * @throws {TapPayValidationError} 當交易 ID 或退款 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * await client.cancelRefund('D20231201123456789', 'R20231201123456789')
   * ```
   */
  async cancelRefund(recTradeId: string, refundId: string): Promise<RefundCancelResponse> {
    // Validate required fields
    if (!recTradeId || recTradeId.trim() === '') {
      throw new TapPayValidationError('Transaction ID is required', 'recTradeId')
    }

    if (!refundId || refundId.trim() === '') {
      throw new TapPayValidationError('Refund ID is required', 'refundId')
    }

    const body: RefundCancelRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
      refund_id: refundId,
    }

    return this.sendRequest<RefundCancelResponse>(
      '/tpc/transaction/refund/cancel',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 立即請款（當日）
   *
   * 立即請款交易（當日）。
   * 用於將延遲請款交易的請款日期改為當日。
   *
   * @param recTradeId - TapPay 交易 ID
   * @returns Promise 解析為請款回應
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * await client.capToday('D20231201123456789')
   * ```
   */
  async capToday(recTradeId: string): Promise<CapTodayResponse> {
    // Validate required fields
    if (!recTradeId || recTradeId.trim() === '') {
      throw new TapPayValidationError('Transaction ID is required', 'recTradeId')
    }

    const body: CapTodayRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<CapTodayResponse>(
      '/tpc/transaction/cap',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 取消請款
   *
   * 在銀行批次處理前取消待處理的請款。
   *
   * @param recTradeId - TapPay 交易 ID
   * @returns Promise 解析為取消請款回應
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * await client.cancelCapture('D20231201123456789')
   * ```
   */
  async cancelCapture(recTradeId: string): Promise<CapCancelResponse> {
    // Validate required fields
    if (!recTradeId || recTradeId.trim() === '') {
      throw new TapPayValidationError('Transaction ID is required', 'recTradeId')
    }

    const body: CapCancelRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<CapCancelResponse>(
      '/tpc/transaction/cap/cancel',
      body as unknown as Record<string, unknown>
    )
  }

  // ============================================================================
  // Card Management APIs
  // ============================================================================

  /**
   * 綁定卡片
   *
   * 綁定卡片以供未來的 token 付款使用。
   * 會執行一筆 1 TWD 的測試交易並立即退款。
   *
   * @param options - 綁定卡片選項
   * @returns Promise 解析為綁定卡片回應（包含 card_key 和 card_token）
   * @throws {TapPayValidationError} 當必要欄位缺失或無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const response = await client.bindCard({
   *   prime: 'prime_from_frontend',
   *   currency: Currency.TWD,
   *   cardholder: {
   *     phone_number: '+886912345678',
   *     name: 'Test User',
   *     email: 'test@example.com'
   *   }
   * })
   *
   * if (response.card_secret) {
   *   const { card_key, card_token } = response.card_secret
   *   // 儲存以供未來付款使用
   * }
   * ```
   */
  async bindCard(
    options: Omit<BindCardRequest, 'partner_key' | 'merchant_id'>
  ): Promise<BindCardResponse> {
    // Validate required fields
    if (!options.prime || options.prime.trim() === '') {
      throw new TapPayValidationError('Prime is required', 'prime')
    }

    if (!options.currency) {
      throw new TapPayValidationError('Currency is required', 'currency')
    }

    const body: BindCardRequest = {
      ...options,
      partner_key: this.config.partnerKey,
      merchant_id: this.config.merchantId,
    }

    return this.sendRequest<BindCardResponse>(
      '/tpc/card/bind',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 移除綁定的卡片
   *
   * 從 TapPay 伺服器移除已綁定的卡片。
   *
   * @param cardKey - 要移除的卡片 key
   * @param cardToken - 要移除的卡片 token
   * @returns Promise 解析為移除卡片回應
   * @throws {TapPayValidationError} 當 cardKey 或 cardToken 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * await client.removeCard('card_key_123', 'card_token_123')
   * ```
   */
  async removeCard(cardKey: string, cardToken: string): Promise<RemoveCardResponse> {
    // Validate required fields
    if (!cardKey || cardKey.trim() === '') {
      throw new TapPayValidationError('Card key is required', 'cardKey')
    }

    if (!cardToken || cardToken.trim() === '') {
      throw new TapPayValidationError('Card token is required', 'cardToken')
    }

    const body: RemoveCardRequest = {
      partner_key: this.config.partnerKey,
      card_key: cardKey,
      card_token: cardToken,
    }

    return this.sendRequest<RemoveCardResponse>(
      '/tpc/card/remove',
      body as unknown as Record<string, unknown>
    )
  }

  // ============================================================================
  // Query APIs
  // ============================================================================

  /**
   * 查詢交易記錄
   *
   * 使用篩選和分頁功能取得交易記錄。
   * 時間範圍篩選限制為 90 天。
   *
   * @param options - 查詢選項（篩選、分頁、排序）
   * @returns Promise 解析為交易記錄回應
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const records = await client.getRecords({
   *   records_per_page: 10,
   *   page: 0,
   *   filters: {
   *     rec_trade_id: 'D20231201123456789'
   *   }
   * })
   * ```
   */
  async getRecords(options?: Omit<RecordRequest, 'partner_key'>): Promise<RecordResponse> {
    const body: RecordRequest = {
      ...options,
      partner_key: this.config.partnerKey,
    }

    return this.sendRequest<RecordResponse>(
      '/tpc/transaction/query',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 根據 ID 取得單筆交易
   *
   * 便利方法，用於查詢單筆交易記錄。
   *
   * @param recTradeId - TapPay 交易 ID
   * @returns Promise 解析為交易記錄，如果找不到則返回 null
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const record = await client.getTransaction('D20231201123456789')
   * if (record) {
   *   console.log(`Status: ${record.status}`)
   * }
   * ```
   */
  async getTransaction(recTradeId: string) {
    // Validate required fields
    if (!recTradeId || recTradeId.trim() === '') {
      throw new TapPayValidationError('Transaction ID is required', 'recTradeId')
    }

    const response = await this.getRecords({
      filters: {
        rec_trade_id: recTradeId,
      },
    })

    return response.trade_records?.[0] ?? null
  }

  /**
   * 取得交易歷史記錄
   *
   * 取得詳細的交易歷史記錄，包含所有事件（授權、請款、退款等）。
   *
   * @param recTradeId - TapPay 交易 ID
   * @returns Promise 解析為交易歷史回應
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const history = await client.getTradeHistory('D20231201123456789')
   * history.trade_history?.forEach(event => {
   *   console.log(`${event.event_type}: ${event.status}`)
   * })
   * ```
   */
  async getTradeHistory(recTradeId: string): Promise<TradeHistoryResponse> {
    // Validate required fields
    if (!recTradeId || recTradeId.trim() === '') {
      throw new TapPayValidationError('Transaction ID is required', 'recTradeId')
    }

    const body: TradeHistoryRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<TradeHistoryResponse>(
      '/tpc/transaction/trade-history',
      body as unknown as Record<string, unknown>
    )
  }

  // ============================================================================
  // Utility Getters
  // ============================================================================

  /**
   * 取得當前環境
   *
   * @returns 當前使用的 TapPay API 環境（Sandbox 或 Production）
   * @readonly
   */
  get environment(): Env {
    return this.config.env
  }

  /**
   * 檢查是否使用沙盒環境
   *
   * @returns 如果使用沙盒環境則返回 true，否則返回 false
   * @readonly
   */
  get isSandbox(): boolean {
    return this.config.env === Env.Sandbox
  }

  /**
   * 取得商家 ID
   *
   * @returns 商家 ID
   * @readonly
   */
  get merchantId(): string {
    return this.config.merchantId
  }
}
