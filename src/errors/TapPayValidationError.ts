/**
 * TapPay 驗證錯誤
 *
 * 當請求驗證失敗時拋出此錯誤。
 * 通常在發送 API 請求前進行輸入驗證時發生。
 *
 * @example
 * ```typescript
 * try {
 *   await client.payByPrime({
 *     prime: '', // 無效的 prime
 *     amount: 100
 *   })
 * } catch (error) {
 *   if (error instanceof TapPayValidationError) {
 *     console.error(`驗證失敗的欄位: ${error.field}`)
 *     console.error(`錯誤訊息: ${error.message}`)
 *   }
 * }
 * ```
 */
export class TapPayValidationError extends Error {
  /**
   * 驗證失敗的欄位名稱
   *
   * @readonly
   */
  readonly field: string | undefined

  /**
   * 建立 TapPay 驗證錯誤實例
   *
   * @param message - 錯誤訊息
   * @param field - 驗證失敗的欄位名稱（可選）
   */
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'TapPayValidationError'
    this.field = field

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TapPayValidationError)
    }
  }
}
