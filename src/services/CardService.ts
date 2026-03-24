import type {
  BindCardRequest,
  RemoveCardRequest,
  TradeHistoryRequest,
} from '../payments/PaymentRequest'
import type {
  BindCardResponse,
  RemoveCardResponse,
  TradeHistoryResponse,
} from '../payments/PaymentResponse'
import { validateRequired, validateRequiredField } from '../utils/validators'
import { BaseService } from './BaseService'

/**
 * 卡片管理服務
 *
 * 提供卡片相關的 API 方法，包括綁定卡片、移除卡片和查詢卡片交易歷史。
 */
export class CardService extends BaseService {
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
   * const response = await cardService.bindCard({
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
    validateRequired(options.prime, 'prime')
    validateRequiredField(options.currency, 'currency')

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
   * await cardService.removeCard('card_key_123', 'card_token_123')
   * ```
   */
  async removeCard(cardKey: string, cardToken: string): Promise<RemoveCardResponse> {
    // Validate required fields
    validateRequired(cardKey, 'cardKey')
    validateRequired(cardToken, 'cardToken')

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

  /**
   * 查詢卡片交易歷史
   *
   * 取得使用特定卡片進行的所有交易記錄。
   *
   * @param recTradeId - TapPay 交易 ID（用於標識卡片）
   * @returns Promise 解析為交易歷史回應
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const history = await cardService.getTradeHistory('D20231201123456789')
   * ```
   */
  async getTradeHistory(recTradeId: string): Promise<TradeHistoryResponse> {
    // Validate required fields
    validateRequired(recTradeId, 'recTradeId')

    const body: TradeHistoryRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<TradeHistoryResponse>(
      '/tpc/transaction/trade-history',
      body as unknown as Record<string, unknown>
    )
  }
}
