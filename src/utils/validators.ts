import type { TapPayConfig } from '../config/TapPayConfig'
import { TapPayConfigError } from '../errors/TapPayConfigError'
import { TapPayValidationError } from '../errors/TapPayValidationError'

/**
 * 驗證字串為必填且非空
 *
 * 檢查提供的值是否為非空字串。如果值為 undefined、null 或空字串（包括只有空格的字串），
 * 將拋出 TapPayValidationError。
 *
 * @param value - 要驗證的字串值
 * @param fieldName - 欄位名稱（用於錯誤訊息）
 * @throws {TapPayValidationError} 當 value 為 undefined、null、空字串或只有空格時
 *
 * @example
 * ```typescript
 * validateRequired('prime_value', 'prime') // ✓ 通過
 * validateRequired('', 'prime') // ✗ 拋出錯誤
 * validateRequired(undefined, 'prime') // ✗ 拋出錯誤
 * ```
 */
export function validateRequired(
  value: string | undefined,
  fieldName: string
): asserts value is string {
  if (!value || value.trim() === '') {
    throw new TapPayValidationError(`${fieldName} is required`, fieldName)
  }
}

/**
 * 驗證金額為正數
 *
 * 檢查提供的金額是否為正數（> 0）。如果金額為 undefined 或 <= 0，
 * 將拋出 TapPayValidationError。
 *
 * @param amount - 要驗證的金額
 * @param fieldName - 欄位名稱（用於錯誤訊息）
 * @throws {TapPayValidationError} 當 amount 為 undefined 或 <= 0 時
 *
 * @example
 * ```typescript
 * validateAmount(100, 'amount') // ✓ 通過
 * validateAmount(0, 'amount') // ✗ 拋出錯誤
 * validateAmount(undefined, 'amount') // ✗ 拋出錯誤
 * ```
 */
export function validateAmount(
  amount: number | undefined,
  fieldName: string
): asserts amount is number {
  if (amount === undefined || amount <= 0) {
    throw new TapPayValidationError(`${fieldName} must be positive`, fieldName)
  }
}

/**
 * 驗證可選欄位（允許 undefined，但不允許空字串）
 *
 * 檢查提供的值是否為有效的可選字串。允許 undefined，但如果值已定義，
 * 則不允許空字串或只有空格的字串。
 *
 * @param value - 要驗證的字串值
 * @param fieldName - 欄位名稱（用於錯誤訊息）
 * @throws {TapPayValidationError} 當 value 已定義但為空字串或只有空格時
 *
 * @example
 * ```typescript
 * validateOptionalField(undefined, 'order_number') // ✓ 通過
 * validateOptionalField('ORDER-123', 'order_number') // ✓ 通過
 * validateOptionalField('', 'order_number') // ✗ 拋出錯誤
 * ```
 */
export function validateOptionalField(value: string | undefined, fieldName: string): void {
  if (value !== undefined && value.trim() === '') {
    throw new TapPayValidationError(`${fieldName} must be non-empty if provided`, fieldName)
  }
}

/**
 * 驗證必填欄位（通用驗證，無 trim）
 *
 * 檢查提供的值是否為已定義（truthy）。用於驗證不支援 trim 的欄位，
 * 例如 enum 類型或其他非字串類型的值。
 *
 * @param value - 要驗證的值
 * @param fieldName - 欄位名稱（用於錯誤訊息）
 * @throws {TapPayValidationError} 當 value 為 undefined、null 或 falsy 時
 *
 * @example
 * ```typescript
 * validateRequiredField(Currency.TWD, 'currency') // ✓ 通過
 * validateRequiredField(undefined, 'currency') // ✗ 拋出錯誤
 * ```
 */
export function validateRequiredField(value: unknown, fieldName: string): void {
  if (!value) {
    throw new TapPayValidationError(`${fieldName} is required`, fieldName)
  }
}

/**
 * 驗證 TapPay 客戶端配置
 *
 * 驗證所有必要的配置欄位是否有效。檢查 partnerKey 和 merchantId 不為空字串，
 * 並檢查 timeout（如果提供）為正數。
 *
 * @param config - TapPay 客戶端配置物件
 * @throws {TapPayConfigError} 當配置無效時
 *
 * @example
 * ```typescript
 * validateConfig({
 *   partnerKey: 'key123',
 *   merchantId: 'merchant456'
 * }) // ✓ 通過
 *
 * validateConfig({
 *   partnerKey: '',
 *   merchantId: 'merchant456'
 * }) // ✗ 拋出錯誤
 * ```
 */
export function validateConfig(config: TapPayConfig): void {
  if (!config.partnerKey || config.partnerKey.trim() === '') {
    throw new TapPayConfigError('Partner Key is required', 'partnerKey')
  }

  if (!config.merchantId || config.merchantId.trim() === '') {
    throw new TapPayConfigError('Merchant ID is required', 'merchantId')
  }

  if (config.timeout !== undefined && config.timeout <= 0) {
    throw new TapPayConfigError('Timeout must be positive', 'timeout')
  }
}
