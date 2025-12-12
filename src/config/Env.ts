/**
 * TapPay API Environment
 */
export const Env = {
  /**
   * Sandbox environment for testing
   */
  Sandbox: 'https://sandbox.tappaysdk.com',

  /**
   * Production environment for live transactions
   */
  Production: 'https://prod.tappaysdk.com',
} as const

export type Env = (typeof Env)[keyof typeof Env]
