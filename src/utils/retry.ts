/**
 * 重試選項配置
 *
 * @interface RetryOptions
 * @property maxRetries - 最大重試次數（預設 3）
 * @property baseDelay - 初始延遲毫秒數（預設 100）
 * @property maxDelay - 最大延遲毫秒數（預設 5000）
 * @property backoffMultiplier - 退避倍數（預設 2）
 * @property shouldRetry - 自訂重試條件函數
 */
export interface RetryOptions {
  /**
   * 最大重試次數
   *
   * @default 3
   */
  maxRetries?: number

  /**
   * 初始延遲毫秒數
   *
   * @default 100
   */
  baseDelay?: number

  /**
   * 最大延遲毫秒數
   *
   * @default 5000
   */
  maxDelay?: number

  /**
   * 指數退避倍數
   *
   * @default 2
   */
  backoffMultiplier?: number

  /**
   * 自訂重試判斷函數
   * 返回 true 表示應該重試此錯誤
   *
   * @param error - 拋出的錯誤物件
   * @returns 是否應該重試
   */
  shouldRetry?: (error: unknown) => boolean
}

/**
 * 預設重試選項
 *
 * @internal
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 100,
  maxDelay: 5000,
  backoffMultiplier: 2,
  shouldRetry: () => true,
} as const

/**
 * 計算指數退避延遲時間
 *
 * @internal
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const exponentialDelay = baseDelay * backoffMultiplier ** attempt
  return Math.min(exponentialDelay, maxDelay)
}

/**
 * 暫停執行指定毫秒數
 *
 * @internal
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 帶指數退避的非同步重試執行
 *
 * 自動重試失敗的非同步操作，採用指數退避演算法。
 * 每次失敗時延遲遞增，直到達到最大延遲時間。
 *
 * @typeParam T - 操作返回的結果類型
 * @param operation - 要執行的非同步操作函數
 * @param options - 重試配置選項
 * @returns 操作的返回值
 * @throws {Error} 達到最大重試次數後拋出原始錯誤
 *
 * @example
 * ```typescript
 * import { retryWithBackoff } from '@carllee1983/tappay-backend-payment-node'
 *
 * // 基本用法：預設配置（最多 3 次重試）
 * const result = await retryWithBackoff(async () => {
 *   return await fetch('https://api.example.com/data')
 * })
 *
 * // 自訂重試次數和延遲
 * const response = await retryWithBackoff(
 *   async () => client.getTransaction(id),
 *   {
 *     maxRetries: 5,
 *     baseDelay: 200,
 *     maxDelay: 10000,
 *     backoffMultiplier: 2
 *   }
 * )
 *
 * // 自訂重試判斷（只重試特定錯誤）
 * const data = await retryWithBackoff(
 *   async () => client.fetchData(),
 *   {
 *     maxRetries: 3,
 *     shouldRetry: (error: unknown) => {
 *       // 只重試 5xx 錯誤和 429 Too Many Requests
 *       if (error instanceof Response) {
 *         return error.status >= 500 || error.status === 429
 *       }
 *       return false
 *     }
 *   }
 * )
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const mergedOptions: Required<RetryOptions> = {
    maxRetries: options?.maxRetries ?? DEFAULT_RETRY_OPTIONS.maxRetries,
    baseDelay: options?.baseDelay ?? DEFAULT_RETRY_OPTIONS.baseDelay,
    maxDelay: options?.maxDelay ?? DEFAULT_RETRY_OPTIONS.maxDelay,
    backoffMultiplier: options?.backoffMultiplier ?? DEFAULT_RETRY_OPTIONS.backoffMultiplier,
    shouldRetry: options?.shouldRetry ?? DEFAULT_RETRY_OPTIONS.shouldRetry,
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= mergedOptions.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // 檢查是否應該重試
      if (!mergedOptions.shouldRetry(error)) {
        throw error
      }

      // 如果是最後一次嘗試，拋出錯誤
      if (attempt === mergedOptions.maxRetries) {
        throw error
      }

      // 計算延遲時間並等待
      const delayMs = calculateDelay(
        attempt,
        mergedOptions.baseDelay,
        mergedOptions.maxDelay,
        mergedOptions.backoffMultiplier
      )

      await delay(delayMs)
    }
  }

  // 此行不會被執行，但需要用於類型檢查
  throw lastError
}
