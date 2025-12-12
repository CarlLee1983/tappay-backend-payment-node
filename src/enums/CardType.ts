/**
 * Card Type
 */
export const CardType = {
  /** Credit Card */
  Credit: 1,
  /** Debit Card */
  Debit: 2,
  /** Prepaid Card */
  Prepaid: 3,
} as const

export type CardType = (typeof CardType)[keyof typeof CardType]

/**
 * Get card type name
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
