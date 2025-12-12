import type { CardType } from '../enums/CardType'

/**
 * Card information returned in API response
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
 * Card secret for token-based payments
 */
export interface CardSecret {
  /**
   * Card token for subsequent Pay by Token transactions
   */
  card_token: string

  /**
   * Card key for subsequent Pay by Token transactions
   */
  card_key: string
}
