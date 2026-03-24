import type { TapPayConfig } from '../config/TapPayConfig'
import { TapPayError } from '../errors/TapPayError'
import { TapPayTimeoutError } from '../errors/TapPayTimeoutError'
import type { TapPayBaseResponse } from '../payments/PaymentResponse'

/**
 * 抽象基類，提供所有 Service 共享的功能
 *
 * 負責 HTTP 請求處理、錯誤管理和超時控制。
 * 所有 Service 類別都應繼承此類別。
 */
export abstract class BaseService {
  protected readonly config: Required<TapPayConfig>

  /**
   * 建立 BaseService 實例
   *
   * @param config - TapPay 客戶端配置
   */
  constructor(config: Required<TapPayConfig>) {
    this.config = config
  }

  /**
   * 向 TapPay API 發送請求
   *
   * 將請求發送至指定的 API 端點，處理所有錯誤情況，包括：
   * - HTTP 錯誤（狀態碼非 2xx）
   * - 超時錯誤（超過配置的超時時間）
   * - JSON 解析錯誤
   * - TapPay 回應錯誤（status !== 0）
   *
   * 請求會附上 API 密鑰作為 `x-api-key` 標頭。
   *
   * @template T - 回應資料類型，必須包含 `status` 欄位
   * @param endpoint - API 端點路徑（例如：`/tpc/payment/pay-by-prime`）
   * @param body - 請求 payload（將轉換為 JSON）
   * @returns 解析後的 TapPay API 回應
   * @throws {TapPayError} 當 HTTP 請求失敗或 TapPay 回應狀態碼非 0 時
   * @throws {TapPayTimeoutError} 當請求超過配置的超時時間時
   *
   * @example
   * ```typescript
   * const response = await this.sendRequest<PaymentResponse>(
   *   '/tpc/payment/pay-by-prime',
   *   { prime: 'token_from_frontend', amount: 100, ... }
   * )
   * ```
   */
  protected async sendRequest<T extends TapPayBaseResponse>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.env}${endpoint}`

    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.partnerKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      // Handle HTTP errors with better error message extraction
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorText = await response.text()
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText) as { msg?: string; message?: string }
              if (errorData.msg) {
                errorMessage = errorData.msg
              } else if (errorData.message) {
                errorMessage = errorData.message
              }
            } catch {
              // If JSON parsing fails, use the raw text if it's not too long
              if (errorText.length < 500) {
                errorMessage = errorText
              }
            }
          }
        } catch {
          // Ignore errors when reading response, use default message
        }
        throw new TapPayError(errorMessage, response.status)
      }

      // Parse JSON response with error handling
      let data: T
      try {
        const text = await response.text()
        if (!text) {
          throw new TapPayError('Empty response from server', response.status)
        }
        data = JSON.parse(text) as T
      } catch (parseError) {
        throw new TapPayError(
          `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
          response.status
        )
      }

      // Check TapPay status code
      if (data.status !== 0) {
        throw TapPayError.fromResponse(data as TapPayBaseResponse & { rec_trade_id?: string })
      }

      return data
    } catch (error) {
      // Re-throw TapPay errors as-is
      if (error instanceof TapPayError) {
        throw error
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TapPayTimeoutError(
          `Request timeout after ${this.config.timeout}ms`,
          this.config.timeout,
          endpoint
        )
      }

      // Handle other errors with more detailed messages
      const errorMessage =
        error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error occurred'
      throw new TapPayError(`Network error: ${errorMessage}`, -1)
    } finally {
      // Ensure timeout is always cleared
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }
}
