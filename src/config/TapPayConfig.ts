import type { Env } from './Env'

/**
 * TapPay Client Configuration
 */
export interface TapPayConfig {
  /**
   * Partner Key from TapPay Portal
   */
  partnerKey: string

  /**
   * Merchant ID from TapPay Portal
   */
  merchantId: string

  /**
   * API Environment (Sandbox or Production)
   * @default Env.Sandbox
   */
  env?: Env

  /**
   * Request timeout in milliseconds
   * TapPay recommends at least 30 seconds for peak hours
   * @default 30000
   */
  timeout?: number
}
