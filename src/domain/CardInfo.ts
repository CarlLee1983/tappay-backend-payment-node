import type { CardType } from '../enums/CardType'

/**
 * 卡片資訊
 *
 * API 回應中返回的卡片資訊，包含卡片的基本資料。
 *
 * @example
 * ```typescript
 * const response = await client.payByPrime({ ... })
 * if (response.card_info) {
 *   console.log(`卡片後四碼: ${response.card_info.last_four}`)
 *   console.log(`發卡銀行: ${response.card_info.issuer}`)
 * }
 * ```
 */
export interface CardInfo {
  /**
   * First 6 digits of card number (BIN)
   */
  bin_code?: string

  /**
   * Last 4 digits of card number
   */
  last_four?: string

  /**
   * Card issuer/bank name
   */
  issuer?: string

  /**
   * Card issuing bank ID
   */
  issuer_zh_tw?: string

  /**
   * Bank ID
   */
  bank_id?: string

  /**
   * Card funding type (1=Credit, 2=Debit, 3=Prepaid)
   */
  funding?: CardType

  /**
   * Card type (1=VISA, 2=MasterCard, 3=JCB, 4=Union Pay, 5=AMEX)
   */
  type?: number

  /**
   * Card level (e.g., "1" for normal, "2" for gold, "3" for platinum)
   */
  level?: string

  /**
   * Country code of issuing bank
   */
  country?: string

  /**
   * Country code (ISO 3166-1 alpha-2)
   */
  country_code?: string

  /**
   * Card expiry date (YYYYMM format)
   */
  expiry_date?: string
}

/**
 * 卡片密鑰資訊
 *
 * 用於 token 付款的卡片憑證，從 Pay by Prime 或 Bind Card API 取得。
 * 必須安全儲存以供未來的 Pay by Token 交易使用。
 *
 * @example
 * ```typescript
 * const response = await client.payByPrime({
 *   prime: 'test_prime',
 *   amount: 100,
 *   remember: true // 啟用記住卡片
 * })
 *
 * if (response.card_secret) {
 *   const { card_key, card_token } = response.card_secret
 *   // 安全儲存到資料庫
 *   await saveCardCredentials(userId, card_key, card_token)
 * }
 * ```
 */
export interface CardSecret {
  /**
   * 卡片 token（用於後續的 Pay by Token 交易）
   *
   * 與 card_key 配對使用，用於識別已綁定的卡片。
   */
  card_token: string

  /**
   * 卡片 key（用於後續的 Pay by Token 交易）
   *
   * 與 card_token 配對使用，用於識別已綁定的卡片。
   */
  card_key: string
}
