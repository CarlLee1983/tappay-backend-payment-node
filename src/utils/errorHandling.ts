/**
 * 敏感資訊清理規則
 *
 * @internal
 */
const SENSITIVE_PATTERNS = [
  { pattern: /"prime"\s*:\s*"[^"]*"/gi, replacement: '"prime":"***"' },
  { pattern: /"card_number"\s*:\s*"[^"]*"/gi, replacement: '"card_number":"****"' },
  { pattern: /"card"\s*:\s*{\s*"number"\s*:\s*"[^"]*"/gi, replacement: '"card":{"number":"****"' },
  { pattern: /"amount"\s*:\s*\d+/gi, replacement: '"amount":"***"' },
  { pattern: /"partner_key"\s*:\s*"[^"]*"/gi, replacement: '"partner_key":"***"' },
  { pattern: /"nonce"\s*:\s*"[^"]*"/gi, replacement: '"nonce":"***"' },
  { pattern: /"token"\s*:\s*"[^"]*"/gi, replacement: '"token":"***"' },
] as const

/**
 * 清理錯誤物件中的敏感資訊以供日誌記錄
 *
 * 移除信用卡號、金額、prime、partner key 等敏感資訊，
 * 同時保留除錯所需的錯誤類型、狀態碼和訊息。
 *
 * @param error - 任何類型的錯誤物件
 * @returns 清理後的錯誤訊息字串
 *
 * @example
 * ```typescript
 * import { scrubErrorForLogging } from '@carllee1983/tappay-backend-payment-node'
 *
 * try {
 *   await client.payByPrime({
 *     prime: 'sensitive_prime',
 *     amount: 1000,
 *     // ...
 *   })
 * } catch (error) {
 *   // 記錄清理後的錯誤（不包含敏感資訊）
 *   const safeLog = scrubErrorForLogging(error)
 *   logger.error('Payment failed:', safeLog)
 *   // 輸出: Payment failed: {"statusCode":400,"message":"Invalid prime","details":"***"}
 * }
 * ```
 */
export function scrubErrorForLogging(error: unknown): string {
  try {
    let errorString: string

    if (error instanceof Error) {
      // 標準 Error 物件
      errorString = JSON.stringify({
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      })
    } else if (error && typeof error === 'object') {
      // 泛型物件（包括 TapPayError、Response 等）
      const errorObj = error as Record<string, unknown>

      // 先將整個物件轉換為 JSON 字串，以便應用正規表達式清理
      errorString = JSON.stringify(errorObj)
    } else if (typeof error === 'string') {
      errorString = error
    } else {
      errorString = String(error)
    }

    // 應用敏感資訊清理規則
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      errorString = errorString.replace(pattern, replacement)
    }

    return errorString
  } catch {
    // 如果清理過程出錯，返回通用訊息
    return '[Error occurred during error scrubbing]'
  }
}

/**
 * 判斷錯誤是否應該重試
 *
 * 根據錯誤類型和 HTTP 狀態碼判斷是否應該重試。
 * 通常應重試的錯誤包括：
 * - 5xx 伺服器錯誤
 * - 429 Too Many Requests
 * - 連接超時
 * - 網路錯誤
 *
 * @param error - 要判斷的錯誤物件
 * @returns true 表示應該重試，false 表示應該放棄
 *
 * @example
 * ```typescript
 * import { isRetryableError, retryWithBackoff } from '@carllee1983/tappay-backend-payment-node'
 *
 * // 在重試邏輯中使用
 * const result = await retryWithBackoff(
 *   async () => client.getTransaction(id),
 *   {
 *     maxRetries: 3,
 *     shouldRetry: isRetryableError
 *   }
 * )
 *
 * // 或用於錯誤處理決策
 * try {
 *   const data = await fetchData()
 * } catch (error) {
 *   if (isRetryableError(error)) {
 *     // 可以重試
 *     return retryWithBackoff(() => fetchData())
 *   } else {
 *     // 不應重試的錯誤（如驗證錯誤）
 *     throw error
 *   }
 * }
 * ```
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) {
    return false
  }

  // 檢查 HTTP 狀態碼
  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>

    // 檢查 statusCode 或 status
    const statusCode =
      (errorObj.statusCode as number) || (errorObj.status as number) || (errorObj.code as number)

    if (typeof statusCode === 'number') {
      // 重試 5xx 錯誤和 429 Too Many Requests
      return statusCode >= 500 || statusCode === 429
    }

    // 檢查特定的錯誤訊息（如超時、連接錯誤）
    const message = (errorObj.message as string) || ''
    const messageLower = message.toLowerCase()
    const retryableMessages = [
      'timeout',
      'econnrefused',
      'econnreset',
      'ehostunreach',
      'enetunreach',
      'enotfound',
      'connection',
    ]

    return retryableMessages.some((msg) => messageLower.includes(msg))
  }

  // 檢查 Error 訊息
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('timeout') || message.includes('connection')
  }

  return false
}
