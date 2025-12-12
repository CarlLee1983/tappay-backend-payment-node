/**
 * TapPay Validation Error
 * Thrown when request validation fails
 */
export class TapPayValidationError extends Error {
  /**
   * The field that failed validation
   */
  readonly field: string | undefined

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'TapPayValidationError'
    this.field = field

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TapPayValidationError)
    }
  }
}
