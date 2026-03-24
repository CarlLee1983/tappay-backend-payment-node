import type {
  CapCancelRequest,
  CapTodayRequest,
  RecordRequest,
  RefundCancelRequest,
  RefundRequest,
} from '../payments/PaymentRequest'
import type {
  CapCancelResponse,
  CapTodayResponse,
  RecordResponse,
  RefundCancelResponse,
  RefundResponse,
} from '../payments/PaymentResponse'
import { validateAmount, validateRequired } from '../utils/validators'
import { BaseService } from './BaseService'

/**
 * 交易管理服務
 *
 * 提供交易相關的 API 方法，包括退款、請款、取消等操作。
 */
export class TransactionService extends BaseService {
  /**
   * 退款
   *
   * 對已完成的交易進行退款，支援全額或部分退款。
   *
   * @param recTradeId - TapPay 交易 ID
   * @param options - 退款選項（金額為可選，若未指定則為全額退款）
   * @returns Promise 解析為退款回應
   * @throws {TapPayValidationError} 當交易 ID 無效或金額格式不正確時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * // 全額退款
   * await transactionService.refund('D20231201123456789')
   *
   * // 部分退款
   * await transactionService.refund('D20231201123456789', { amount: 50 })
   * ```
   */
  async refund(
    recTradeId: string,
    options?: Omit<RefundRequest, 'partner_key' | 'rec_trade_id'>
  ): Promise<RefundResponse> {
    // Validate required fields
    validateRequired(recTradeId, 'recTradeId')

    // Validate amount if provided (must be positive)
    if (options?.amount !== undefined) {
      validateAmount(options.amount, 'amount')
    }

    const body: RefundRequest = {
      ...options,
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<RefundResponse>(
      '/tpc/transaction/refund',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 取消退款
   *
   * 在銀行批次處理前取消待處理的退款。
   * 目前僅支援台新銀行。
   *
   * @param recTradeId - TapPay 交易 ID
   * @param refundId - 要取消的退款 ID
   * @returns Promise 解析為取消退款回應
   * @throws {TapPayValidationError} 當交易 ID 或退款 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * await transactionService.cancelRefund('D20231201123456789', 'R20231201123456789')
   * ```
   */
  async cancelRefund(recTradeId: string, refundId: string): Promise<RefundCancelResponse> {
    // Validate required fields
    validateRequired(recTradeId, 'recTradeId')
    validateRequired(refundId, 'refundId')

    const body: RefundCancelRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
      refund_id: refundId,
    }

    return this.sendRequest<RefundCancelResponse>(
      '/tpc/transaction/refund/cancel',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 立即請款（當日）
   *
   * 立即請款交易（當日）。
   * 用於將延遲請款交易的請款日期改為當日。
   *
   * @param recTradeId - TapPay 交易 ID
   * @returns Promise 解析為請款回應
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * await transactionService.capToday('D20231201123456789')
   * ```
   */
  async capToday(recTradeId: string): Promise<CapTodayResponse> {
    // Validate required fields
    validateRequired(recTradeId, 'recTradeId')

    const body: CapTodayRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<CapTodayResponse>(
      '/tpc/transaction/cap',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 取消請款
   *
   * 在銀行批次處理前取消待處理的請款。
   *
   * @param recTradeId - TapPay 交易 ID
   * @returns Promise 解析為取消請款回應
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * await transactionService.cancelCapture('D20231201123456789')
   * ```
   */
  async cancelCapture(recTradeId: string): Promise<CapCancelResponse> {
    // Validate required fields
    validateRequired(recTradeId, 'recTradeId')

    const body: CapCancelRequest = {
      partner_key: this.config.partnerKey,
      rec_trade_id: recTradeId,
    }

    return this.sendRequest<CapCancelResponse>(
      '/tpc/transaction/cap/cancel',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 查詢交易記錄
   *
   * 使用篩選和分頁功能取得交易記錄。
   * 時間範圍篩選限制為 90 天。
   *
   * @param options - 查詢選項（篩選、分頁、排序）
   * @returns Promise 解析為交易記錄回應
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const records = await transactionService.getRecords({
   *   records_per_page: 10,
   *   page: 0,
   *   filters: {
   *     rec_trade_id: 'D20231201123456789'
   *   }
   * })
   * ```
   */
  async getRecords(options?: Omit<RecordRequest, 'partner_key'>): Promise<RecordResponse> {
    const body: RecordRequest = {
      ...options,
      partner_key: this.config.partnerKey,
    }

    return this.sendRequest<RecordResponse>(
      '/tpc/transaction/query',
      body as unknown as Record<string, unknown>
    )
  }

  /**
   * 根據 ID 取得單筆交易
   *
   * 便利方法，用於查詢單筆交易記錄。
   *
   * @param recTradeId - TapPay 交易 ID
   * @returns Promise 解析為交易記錄，如果找不到則返回 null
   * @throws {TapPayValidationError} 當交易 ID 無效時
   * @throws {TapPayError} 當 API 回應錯誤時
   * @throws {TapPayTimeoutError} 當請求超時時
   *
   * @example
   * ```typescript
   * const record = await transactionService.getTransaction('D20231201123456789')
   * if (record) {
   *   console.log(`Status: ${record.status}`)
   * }
   * ```
   */
  async getTransaction(recTradeId: string) {
    // Validate required fields
    validateRequired(recTradeId, 'recTradeId')

    const response = await this.getRecords({
      filters: {
        rec_trade_id: recTradeId,
      },
    })

    return response.trade_records?.[0] ?? null
  }
}
