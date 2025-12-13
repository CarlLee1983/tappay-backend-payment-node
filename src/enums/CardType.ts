/**
 * 卡片類型枚舉
 *
 * 定義 TapPay 支援的卡片類型。
 */
export const CardType = {
  /** 信用卡 */
  Credit: 1,
  /** 金融卡 */
  Debit: 2,
  /** 預付卡 */
  Prepaid: 3,
} as const

/**
 * 卡片類型
 */
export type CardType = (typeof CardType)[keyof typeof CardType]

/**
 * 取得卡片類型名稱
 *
 * 將卡片類型數值轉換為可讀的字串名稱。
 *
 * @param type - 卡片類型數值
 * @returns 卡片類型名稱（'Credit', 'Debit', 'Prepaid' 或 'Unknown'）
 *
 * @example
 * ```typescript
 * const typeName = getCardTypeName(CardType.Credit) // 'Credit'
 * const unknown = getCardTypeName(999) // 'Unknown'
 * ```
 */
export function getCardTypeName(type: CardType): string {
  switch (type) {
    case CardType.Credit:
      return 'Credit'
    case CardType.Debit:
      return 'Debit'
    case CardType.Prepaid:
      return 'Prepaid'
    default:
      return 'Unknown'
  }
}
