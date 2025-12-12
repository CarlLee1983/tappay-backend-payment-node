/**
 * Result URL configuration for 3D Secure and e-payment transactions
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
