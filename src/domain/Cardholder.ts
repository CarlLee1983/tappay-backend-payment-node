/**
 * 持卡人資訊
 *
 * 用於交易時的持卡人資訊，用於詐欺偵測和 3D Secure 驗證。
 *
 * @example
 * ```typescript
 * const cardholder: Cardholder = {
 *   phone_number: '+886912345678',
 *   name: '王小明',
 *   name_en: 'Wang Xiao Ming',
 *   email: 'user@example.com',
 *   zip_code: '100',
 *   address: '台北市信義區信義路五段7號'
 * }
 * ```
 */
export interface Cardholder {
  /**
   * Cardholder's phone number
   * Should include country code, e.g., "+886923456789"
   */
  phone_number?: string

  /**
   * Phone number country code
   * Required for international phone numbers
   */
  phone_number_country_code?: string

  /**
   * Cardholder's name
   */
  name?: string

  /**
   * Cardholder's name in English
   * Format: First name + Last name
   */
  name_en?: string

  /**
   * Cardholder's email address
   */
  email?: string

  /**
   * Cardholder's zip/postal code
   */
  zip_code?: string

  /**
   * Cardholder's address
   */
  address?: string

  /**
   * Cardholder's national ID (Taiwan)
   */
  national_id?: string

  /**
   * Member ID in merchant's system
   */
  member_id?: string
}
