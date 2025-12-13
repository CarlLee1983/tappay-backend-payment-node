/**
 * TapPay 配置錯誤
 *
 * 當客戶端配置無效時拋出此錯誤。
 *
 * @example
 * ```typescript
 * try {
 *   const client = new TapPayClient({
 *     partnerKey: '', // 無效的 partner key
 *     merchantId: 'test_merchant_id'
 *   })
 * } catch (error) {
 *   if (error instanceof TapPayConfigError) {
 *     console.error(`配置錯誤欄位: ${error.field}`)
 *   }
 * }
 * ```
 */
export class TapPayConfigError extends Error {
  /**
   * 導致錯誤的配置欄位名稱
   *
   * @readonly
   */
  readonly field: string | undefined

  /**
   * 建立 TapPay 配置錯誤實例
   *
   * @param message - 錯誤訊息
   * @param field - 導致錯誤的配置欄位名稱（可選）
   */
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'TapPayConfigError'
    this.field = field

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TapPayConfigError)
    }
  }
}
