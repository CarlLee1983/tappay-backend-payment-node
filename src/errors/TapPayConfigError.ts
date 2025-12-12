/**
 * TapPay Configuration Error
 * Thrown when client configuration is invalid
 */
export class TapPayConfigError extends Error {
  /**
   * The configuration field that caused the error
   */
  readonly field: string | undefined

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'TapPayConfigError'
    this.field = field

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TapPayConfigError)
    }
  }
}
