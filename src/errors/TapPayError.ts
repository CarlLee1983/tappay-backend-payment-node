/**
 * TapPay 基礎錯誤類別
 *
 * 代表從 TapPay API 返回的錯誤。
 * 所有其他 TapPay 錯誤類別都繼承自此類別。
 *
 * @example
 * ```typescript
 * try {
 *   await client.payByPrime({ prime: 'invalid', amount: 100 })
 * } catch (error) {
 *   if (error instanceof TapPayError) {
 *     console.error(`錯誤狀態碼: ${error.status}`)
 *     console.error(`交易 ID: ${error.recTradeId}`)
 *   }
 * }
 * ```
 */
export class TapPayError extends Error {
  /**
   * TapPay 狀態碼
   *
   * 0 表示成功，其他值表示錯誤。
   *
   * @readonly
   */
  readonly status: number

  /**
   * TapPay 交易 ID（如果可用）
   *
   * @readonly
   */
  readonly recTradeId: string | undefined

  /**
   * 原始回應資料
   *
   * @readonly
   */
  readonly response?: unknown

  /**
   * 建立 TapPay 錯誤實例
   *
   * @param message - 錯誤訊息
   * @param status - TapPay 狀態碼
   * @param recTradeId - TapPay 交易 ID（可選）
   * @param response - 原始回應資料（可選）
   */
  constructor(message: string, status: number, recTradeId?: string, response?: unknown) {
    super(message)
    this.name = 'TapPayError'
    this.status = status
    this.recTradeId = recTradeId
    this.response = response

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TapPayError)
    }
  }

  /**
   * 檢查錯誤是否表示交易失敗
   *
   * @returns 如果狀態碼不為 0 則返回 true，否則返回 false
   * @readonly
   */
  get isTransactionFailed(): boolean {
    return this.status !== 0
  }

  /**
   * 從 API 回應建立 TapPayError
   *
   * @param response - TapPay API 回應物件
   * @returns TapPayError 實例
   * @static
   */
  static fromResponse(response: {
    status: number
    msg: string
    rec_trade_id?: string
  }): TapPayError {
    return new TapPayError(response.msg, response.status, response.rec_trade_id, response)
  }
}
