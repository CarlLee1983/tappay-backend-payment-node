/**
 * TapPay 超時錯誤
 *
 * 當 API 請求超時時拋出此錯誤。
 *
 * @example
 * ```typescript
 * try {
 *   await client.payByPrime({ prime: 'test', amount: 100 })
 * } catch (error) {
 *   if (error instanceof TapPayTimeoutError) {
 *     console.error(`請求超時: ${error.timeout}ms`)
 *     console.error(`端點: ${error.endpoint}`)
 *     // 可以考慮重試
 *   }
 * }
 * ```
 */
export class TapPayTimeoutError extends Error {
  /**
   * 超時時間（毫秒）
   *
   * @readonly
   */
  readonly timeout: number

  /**
   * 超時的 API 端點
   *
   * @readonly
   */
  readonly endpoint: string | undefined

  /**
   * 建立 TapPay 超時錯誤實例
   *
   * @param message - 錯誤訊息
   * @param timeout - 超時時間（毫秒）
   * @param endpoint - 超時的 API 端點（可選）
   */
  constructor(message: string, timeout: number, endpoint?: string) {
    super(message)
    this.name = 'TapPayTimeoutError'
    this.timeout = timeout
    this.endpoint = endpoint

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TapPayTimeoutError)
    }
  }
}
