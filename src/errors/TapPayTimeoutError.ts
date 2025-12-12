/**
 * TapPay Timeout Error
 * Thrown when API request times out
 */
export class TapPayTimeoutError extends Error {
  /**
   * Timeout duration in milliseconds
   */
  readonly timeout: number

  /**
   * The API endpoint that timed out
   */
  readonly endpoint: string | undefined

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
