import { Env } from './config/Env'
import type { TapPayConfig } from './config/TapPayConfig'
import { TapPayConfigError } from './errors/TapPayConfigError'
import { TapPayError } from './errors/TapPayError'
import { TapPayTimeoutError } from './errors/TapPayTimeoutError'
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
 * TapPay Backend Payment Client
 *
 * Core class for interacting with TapPay Backend APIs.
 * Provides methods for payment processing, refunds, card management, and transaction queries.
 *
 * @example
 * ```typescript
 * import { TapPayClient, Env, Currency } from 'tappay-backend-payment'
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
 *   details: 'Test Payment'
 * })
 * ```
 */
export class TapPayClient {
  private readonly config: Required<TapPayConfig>

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
   * Validate client configuration
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
   * Send HTTP request to TapPay API
   */
  private async sendRequest<T extends TapPayBaseResponse>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.env}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.partnerKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new TapPayError(
          `HTTP ${String(response.status)}: ${response.statusText}`,
          response.status
        )
      }

      const data = (await response.json()) as T

      // Check TapPay status code
      if (data.status !== 0) {
        throw TapPayError.fromResponse(data as TapPayBaseResponse & { rec_trade_id?: string })
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof TapPayError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TapPayTimeoutError(
          `Request timeout after ${String(this.config.timeout)}ms`,
          this.config.timeout,
          endpoint
        )
      }

      throw new TapPayError(error instanceof Error ? error.message : 'Unknown error', -1)
    }
  }

  // ============================================================================
  // Payment APIs
  // ============================================================================

  /**
   * Pay by Prime
   *
   * Process a payment using a prime token from frontend SDK.
   * Each prime can only be used once.
   *
   * @param options - Payment options (without partner_key and merchant_id)
   * @returns Payment response
   *
   * @example
   * ```typescript
   * const response = await client.payByPrime({
   *   prime: 'test_prime_123',
   *   amount: 100,
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
   * Pay by Card Token
   *
   * Process a payment using saved card credentials.
   * Requires card_key and card_token from previous Pay by Prime with remember=true.
   *
   * @param options - Payment options with card credentials
   * @returns Payment response
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
   * Refund Transaction
   *
   * Process a full or partial refund.
   * Omit amount for full refund.
   *
   * @param recTradeId - TapPay transaction ID to refund
   * @param options - Optional refund options (amount, bank_refund_id)
   * @returns Refund response
   *
   * @example
   * ```typescript
   * // Full refund
   * await client.refund('D20231201123456789')
   *
   * // Partial refund
   * await client.refund('D20231201123456789', { amount: 50 })
   * ```
   */
  async refund(
    recTradeId: string,
    options?: Omit<RefundRequest, 'partner_key' | 'rec_trade_id'>
  ): Promise<RefundResponse> {
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
   * Cancel Refund
   *
   * Cancel a pending refund before bank batch processing.
   * Currently only supported by Taishin Bank.
   *
   * @param recTradeId - TapPay transaction ID
   * @param refundId - Refund ID to cancel
   * @returns Refund cancel response
   *
   * @example
   * ```typescript
   * await client.cancelRefund('D20231201123456789', 'R20231201123456789')
   * ```
   */
  async cancelRefund(recTradeId: string, refundId: string): Promise<RefundCancelResponse> {
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
   * Capture Today
   *
   * Capture a transaction immediately (same day).
   * Use this to change the capture date to today for delayed capture transactions.
   *
   * @param recTradeId - TapPay transaction ID to capture
   * @returns Cap today response
   *
   * @example
   * ```typescript
   * await client.capToday('D20231201123456789')
   * ```
   */
  async capToday(recTradeId: string): Promise<CapTodayResponse> {
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
   * Cancel Capture
   *
   * Cancel a pending capture before bank batch processing.
   *
   * @param recTradeId - TapPay transaction ID
   * @returns Cap cancel response
   *
   * @example
   * ```typescript
   * await client.cancelCapture('D20231201123456789')
   * ```
   */
  async cancelCapture(recTradeId: string): Promise<CapCancelResponse> {
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
   * Bind Card
   *
   * Bind a card for future token-based payments.
   * A 1 TWD test transaction will be performed and immediately refunded.
   *
   * @param options - Bind card options
   * @returns Bind card response with card_key and card_token
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
   *   // Store for future payments
   * }
   * ```
   */
  async bindCard(
    options: Omit<BindCardRequest, 'partner_key' | 'merchant_id'>
  ): Promise<BindCardResponse> {
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
   * Remove Card
   *
   * Remove a bound card from TapPay servers.
   *
   * @param cardKey - Card key to remove
   * @param cardToken - Card token to remove
   * @returns Remove card response
   *
   * @example
   * ```typescript
   * await client.removeCard('card_key_123', 'card_token_123')
   * ```
   */
  async removeCard(cardKey: string, cardToken: string): Promise<RemoveCardResponse> {
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
   * Query Transaction Records
   *
   * Retrieve transaction records with filtering and pagination.
   * Time range filter is limited to 90 days.
   *
   * @param options - Query options (filters, pagination, sorting)
   * @returns Record response with trade records
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
   * Get single transaction by ID
   *
   * Convenience method to query a single transaction.
   *
   * @param recTradeId - TapPay transaction ID
   * @returns Trade record or null if not found
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
    const response = await this.getRecords({
      filters: {
        rec_trade_id: recTradeId,
      },
    })

    return response.trade_records?.[0] ?? null
  }

  /**
   * Get Trade History
   *
   * Get detailed transaction history including all events (auth, capture, refund, etc.)
   *
   * @param recTradeId - TapPay transaction ID
   * @returns Trade history response
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
   * Get current environment
   */
  get environment(): Env {
    return this.config.env
  }

  /**
   * Check if using sandbox environment
   */
  get isSandbox(): boolean {
    return this.config.env === Env.Sandbox
  }

  /**
   * Get merchant ID
   */
  get merchantId(): string {
    return this.config.merchantId
  }
}
