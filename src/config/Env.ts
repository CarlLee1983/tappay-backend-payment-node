/**
 * TapPay API 環境
 *
 * 定義 TapPay API 的環境端點。
 */
export const Env = {
  /**
   * 沙盒環境（用於測試）
   *
   * 使用測試卡片和測試資料進行開發和測試。
   */
  Sandbox: 'https://sandbox.tappaysdk.com',

  /**
   * 正式環境（用於實際交易）
   *
   * 使用真實卡片進行實際交易。
   */
  Production: 'https://prod.tappaysdk.com',
} as const

/**
 * TapPay API 環境類型
 */
export type Env = (typeof Env)[keyof typeof Env]
