import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Webhook 簽名驗證配置
 *
 * @internal
 */
const WEBHOOK_CONFIG = {
  algorithm: 'sha256',
  encoding: 'hex' as const,
} as const

/**
 * 驗證 TapPay Webhook 簽名
 *
 * 使用 HMAC-SHA256 驗證 Webhook payload 的簽名，防止重放攻擊和未授權修改。
 * 採用時序安全的比較方式避免計時側信道攻擊。
 *
 * @param payload - Webhook payload 物件（未序列化）
 * @param signature - 接收到的 Webhook 簽名（十六進位字串）
 * @param partnerKey - TapPay Partner Key
 * @returns 簽名是否有效
 *
 * @throws {Error} 如果 payload 無法序列化
 *
 * @example
 * ```typescript
 * import { verifyTapPayWebhook } from '@carllee1983/tappay-backend-payment-node'
 *
 * // 在 Express/Fastify webhook 處理器中
 * app.post('/webhook', (req, res) => {
 *   const { signature, body } = req.headers
 *   const payload = req.body
 *
 *   const isValid = verifyTapPayWebhook(
 *     payload,
 *     signature as string,
 *     process.env.TAPPAY_PARTNER_KEY!
 *   )
 *
 *   if (!isValid) {
 *     return res.status(401).json({ error: 'Invalid signature' })
 *   }
 *
 *   // 處理 webhook
 *   processWebhook(payload)
 *   res.json({ success: true })
 * })
 * ```
 */
export function verifyTapPayWebhook(
  payload: Record<string, unknown>,
  signature: string,
  partnerKey: string
): boolean {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  if (!signature || typeof signature !== 'string') {
    return false
  }

  if (!partnerKey || typeof partnerKey !== 'string') {
    return false
  }

  try {
    const expectedSignature = generateWebhookSignature(payload, partnerKey)
    // 時序安全的比較防止計時攻擊
    return timingSafeEqual(
      Buffer.from(signature, WEBHOOK_CONFIG.encoding),
      Buffer.from(expectedSignature, WEBHOOK_CONFIG.encoding)
    )
  } catch {
    return false
  }
}

/**
 * 生成 TapPay Webhook 簽名
 *
 * 將 payload 序列化後使用 HMAC-SHA256 計算簽名。
 * 供測試和內部使用。
 *
 * @param payload - Webhook payload 物件
 * @param partnerKey - TapPay Partner Key
 * @returns 簽名字串（十六進位格式）
 *
 * @throws {Error} 如果 payload 無法序列化
 *
 * @example
 * ```typescript
 * import { generateWebhookSignature } from '@carllee1983/tappay-backend-payment-node'
 *
 * // 生成簽名用於測試
 * const payload = {
 *   status: 0,
 *   message: 'Success',
 *   info: { transactionId: '12345' }
 * }
 * const signature = generateWebhookSignature(payload, 'your_partner_key')
 * ```
 */
export function generateWebhookSignature(
  payload: Record<string, unknown>,
  partnerKey: string
): string {
  const payloadString = JSON.stringify(payload)
  const hmac = createHmac(WEBHOOK_CONFIG.algorithm, partnerKey)
  hmac.update(payloadString)
  return hmac.digest(WEBHOOK_CONFIG.encoding)
}
