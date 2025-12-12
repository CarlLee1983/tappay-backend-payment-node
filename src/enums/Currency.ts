/**
 * ISO 4217 Currency Codes supported by TapPay
 */
export const Currency = {
  /** Taiwan Dollar */
  TWD: 'TWD',
  /** US Dollar */
  USD: 'USD',
  /** Japanese Yen */
  JPY: 'JPY',
  /** Hong Kong Dollar */
  HKD: 'HKD',
  /** Malaysian Ringgit */
  MYR: 'MYR',
  /** Singapore Dollar */
  SGD: 'SGD',
  /** Indonesian Rupiah */
  IDR: 'IDR',
  /** Thai Baht */
  THB: 'THB',
  /** Philippine Peso */
  PHP: 'PHP',
  /** Vietnamese Dong */
  VND: 'VND',
  /** Australian Dollar */
  AUD: 'AUD',
  /** Euro */
  EUR: 'EUR',
  /** British Pound */
  GBP: 'GBP',
} as const

export type Currency = (typeof Currency)[keyof typeof Currency]

/**
 * Multiplier for currency amounts
 * Most currencies need to be multiplied by 100 for TapPay API
 * Exception: TWD uses actual value
 */
export const CurrencyMultiplier: Record<Currency, number> = {
  [Currency.TWD]: 1,
  [Currency.USD]: 100,
  [Currency.JPY]: 1,
  [Currency.HKD]: 100,
  [Currency.MYR]: 100,
  [Currency.SGD]: 100,
  [Currency.IDR]: 1,
  [Currency.THB]: 100,
  [Currency.PHP]: 100,
  [Currency.VND]: 1,
  [Currency.AUD]: 100,
  [Currency.EUR]: 100,
  [Currency.GBP]: 100,
}
