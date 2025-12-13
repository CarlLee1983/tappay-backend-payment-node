/**
 * 結果 URL 配置
 *
 * 用於 3D Secure 和電子支付交易的 URL 配置。
 * 定義前端重導向和後端通知的 URL。
 *
 * @example
 * ```typescript
 * const resultUrl: ResultUrl = {
 *   frontend_redirect_url: 'https://example.com/payment/success',
 *   backend_notify_url: 'https://api.example.com/payment/notify',
 *   go_back_url: 'https://example.com/payment/cancel'
 * }
 * ```
 */
export interface ResultUrl {
  /**
   * Frontend redirect URL after payment completion (HTTPS required)
   */
  frontend_redirect_url?: string

  /**
   * Backend notification URL for async payment results (HTTPS, port 443)
   */
  backend_notify_url?: string

  /**
   * URL for "Go Back" button on 3D error page
   */
  go_back_url?: string
}
