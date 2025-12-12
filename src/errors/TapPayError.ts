/**
 * Base TapPay Error
 * Represents errors returned from TapPay API
 */
export class TapPayError extends Error {
  /**
   * TapPay status code
   * 0 = success, other values indicate errors
   */
  readonly status: number

  /**
   * TapPay transaction ID (if available)
   */
  readonly recTradeId: string | undefined

  /**
   * Original response data
   */
  readonly response?: unknown

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
   * Check if the error indicates a failed transaction
   */
  get isTransactionFailed(): boolean {
    return this.status !== 0
  }

  /**
   * Create a TapPayError from API response
   */
  static fromResponse(response: {
    status: number
    msg: string
    rec_trade_id?: string
  }): TapPayError {
    return new TapPayError(response.msg, response.status, response.rec_trade_id, response)
  }
}
