import type { PayByPrimeRequest, PayByTokenRequest } from '../payments/PaymentRequest'
import type { PaymentResponse } from '../payments/PaymentResponse'
import {
  validateAmount,
  validateOptionalField,
  validateRequired,
  validateRequiredField,
} from '../utils/validators'
import { BaseService } from './BaseService'

/**
 * 支付操作服務
 *
 * 提供支付相關的 API 方法，包括使用 Prime Token 支付和使用已儲存的卡片支付。
 */
export class PaymentService extends BaseService {
  /**
   * 使用 Prime Token 付款
   *
   * 使用從前端取得的 Prime Token 進行付款。
   * Prime Token 由 TapPay 前端 SDK 產生，單次使用。
   *
   * @param options - 付款選項（包含 Prime Token）
   * @returns Promise 解析為付款回應
   * @throws {TapPayValidationError} 當必要欄位缺失或無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const response = await paymentService.payByPrime({
   *   prime: 'prime_from_frontend',
   *   amount: 100,
   *   currency: Currency.TWD,
   *   details: 'Order #12345'
   * })
   * ```
   */
  async payByPrime(
    options: Omit<PayByPrimeRequest, 'partner_key' | 'merchant_id'>
  ): Promise<PaymentResponse> {
    // Validate required fields
    validateRequired(options.prime, 'prime')
    validateAmount(options.amount, 'amount')
    validateOptionalField(options.order_number, 'order_number')

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
   * const response = await paymentService.payByToken({
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
    validateRequired(options.card_key, 'card_key')
    validateRequired(options.card_token, 'card_token')
    validateAmount(options.amount, 'amount')
    validateRequiredField(options.currency, 'currency')
    validateOptionalField(options.order_number, 'order_number')

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
}
