/**
 * TapPay 支援的 ISO 4217 貨幣代碼
 *
 * 定義所有 TapPay API 支援的貨幣類型。
 */
export const Currency = {
  /** 新台幣 */
  TWD: 'TWD',
  /** 美元 */
  USD: 'USD',
  /** 日圓 */
  JPY: 'JPY',
  /** 港幣 */
  HKD: 'HKD',
  /** 馬來西亞令吉 */
  MYR: 'MYR',
  /** 新加坡幣 */
  SGD: 'SGD',
  /** 印尼盾 */
  IDR: 'IDR',
  /** 泰銖 */
  THB: 'THB',
  /** 菲律賓披索 */
  PHP: 'PHP',
  /** 越南盾 */
  VND: 'VND',
  /** 澳幣 */
  AUD: 'AUD',
  /** 歐元 */
  EUR: 'EUR',
  /** 英鎊 */
  GBP: 'GBP',
} as const

/**
 * 貨幣類型
 */
export type Currency = (typeof Currency)[keyof typeof Currency]

/**
 * 貨幣金額乘數
 *
 * 大部分貨幣需要乘以 100 才能傳送給 TapPay API（例如：USD $1.00 = 100）。
 * 例外：TWD、JPY、IDR、VND 使用實際數值。
 *
 * @example
 * ```typescript
 * // TWD 使用實際數值
 * const twdAmount = 100 // 100 TWD
 *
 * // USD 需要乘以 100
 * const usdAmount = 100 * CurrencyMultiplier[Currency.USD] // 100 = $1.00
 * ```
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
