import type { Env } from './Env'

/**
 * TapPay 客戶端配置
 *
 * 定義建立 TapPayClient 實例所需的配置選項。
 *
 * @example
 * ```typescript
 * const config: TapPayConfig = {
 *   partnerKey: 'partner_key_from_portal',
 *   merchantId: 'merchant_id_from_portal',
 *   env: Env.Sandbox,
 *   timeout: 30000
 * }
 * ```
 */
export interface TapPayConfig {
  /**
   * 合作夥伴金鑰（從 TapPay Portal 取得）
   *
   * 用於 API 認證，必須提供且不能為空字串。
   */
  partnerKey: string

  /**
   * 商家 ID（從 TapPay Portal 取得）
   *
   * 識別商家的唯一 ID，必須提供且不能為空字串。
   */
  merchantId: string

  /**
   * API 環境（沙盒或正式環境）
   *
   * @default Env.Sandbox
   */
  env?: Env

  /**
   * 請求超時時間（毫秒）
   *
   * TapPay 建議在尖峰時段至少設定 30 秒。
   *
   * @default 30000
   */
  timeout?: number
}
