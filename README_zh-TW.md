# TapPay Backend Payment SDK

[English](./README.md) | [繁體中文](./README_zh-TW.md)

> TapPay 後端金流 TypeScript SDK

[![npm version](https://img.shields.io/npm/v/tappay-backend-payment.svg)](https://www.npmjs.com/package/tappay-backend-payment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js->=18.0.0-green.svg)](https://nodejs.org/)

## 特色

- 🔒 **完整 TypeScript 支援** - 所有 API 都有完整的型別定義
- 🚀 **現代架構** - 同時支援 ES Modules 和 CommonJS
- ⚡ **零依賴** - 使用原生 `fetch` API（Node.js 18+）
- 🛡️ **錯誤處理** - 具類型的錯誤類別，精確處理各種錯誤
- 📦 **小巧輕量** - 最小化的打包大小

## 安裝

```bash
npm install tappay-backend-payment
# 或
yarn add tappay-backend-payment
# 或
pnpm add tappay-backend-payment
# 或
bun add tappay-backend-payment
```

## 快速開始

```typescript
import { TapPayClient, Env, Currency } from 'tappay-backend-payment'

// 建立客戶端
const client = new TapPayClient({
  partnerKey: 'your_partner_key',
  merchantId: 'your_merchant_id',
  env: Env.Sandbox, // 正式環境使用 Env.Production
})

// 使用 Prime 付款
const payment = await client.payByPrime({
  prime: 'prime_from_frontend',
  amount: 100,
  currency: Currency.TWD,
  details: '商品說明',
  cardholder: {
    phone_number: '+886912345678',
    name: '測試用戶',
    email: 'test@example.com',
  },
})

console.log(`交易識別碼: ${payment.rec_trade_id}`)
```

## API 參考

### TapPayClient

與 TapPay API 互動的主要客戶端類別。

#### 建構函式

```typescript
new TapPayClient({
  partnerKey: string,   // 必填：TapPay Portal 的 Partner Key
  merchantId: string,   // 必填：商店代號
  env?: Env,            // 選填：Env.Sandbox（預設）或 Env.Production
  timeout?: number,     // 選填：請求逾時（毫秒），預設 30000
})
```

### 付款方法

#### Pay by Prime

使用前端 SDK 取得的 prime token 進行付款。

```typescript
const response = await client.payByPrime({
  prime: 'test_prime_123',
  amount: 100,
  currency: Currency.TWD,
  details: '測試付款',
  cardholder: {
    phone_number: '+886912345678',
    name: '測試用戶',
    email: 'test@example.com',
  },
  // 選填：啟用 3D 驗證
  three_domain_secure: true,
  result_url: {
    frontend_redirect_url: 'https://example.com/payment/success',
    backend_notify_url: 'https://example.com/api/notify',
  },
  // 選填：記住卡片以供未來使用
  remember: true,
})

// 若 remember=true，儲存這些資訊供之後使用
if (response.card_secret) {
  const { card_key, card_token } = response.card_secret
  // 安全儲存以供定期扣款使用
}
```

#### Pay by Card Token

使用已儲存的卡片憑證進行付款。

```typescript
const response = await client.payByToken({
  card_key: 'saved_card_key',
  card_token: 'saved_card_token',
  amount: 100,
  currency: Currency.TWD,
  details: '定期扣款',
})
```

### 交易管理

#### 退款

處理全額或部分退款。

```typescript
// 全額退款
await client.refund('D20231201123456789')

// 部分退款
await client.refund('D20231201123456789', { amount: 50 })
```

#### 查詢交易紀錄

使用篩選和分頁取得交易紀錄。

```typescript
const records = await client.getRecords({
  records_per_page: 10,
  page: 0,
  filters: {
    time: {
      start_time: Date.now() - 7 * 24 * 60 * 60 * 1000, // 過去 7 天
      end_time: Date.now(),
    },
  },
  order_by: {
    attribute: 'time',
    is_descending: true,
  },
})
```

#### 取得單筆交易

```typescript
const record = await client.getTransaction('D20231201123456789')
if (record) {
  console.log(`狀態: ${record.status}`)
}
```

#### 取得交易歷程

取得詳細的交易歷程，包含所有事件。

```typescript
const history = await client.getTradeHistory('D20231201123456789')
history.trade_history?.forEach(event => {
  console.log(`${event.event_type}: ${event.status}`)
})
```

### 進階 API

#### 當日請款

立即請款延遲請款的交易。

```typescript
await client.capToday('D20231201123456789')
```

#### 取消請款

在銀行批次處理前取消待處理的請款。

```typescript
await client.cancelCapture('D20231201123456789')
```

#### 取消退款

取消待處理的退款（目前僅支援台新銀行）。

```typescript
await client.cancelRefund('D20231201123456789', 'R20231201123456789')
```

### 卡片管理

#### 綁定卡片

綁定卡片以供未來使用 Token 付款，不會實際扣款。

```typescript
const response = await client.bindCard({
  prime: 'prime_from_frontend',
  currency: Currency.TWD,
  cardholder: {
    phone_number: '+886912345678',
    name: '測試用戶',
    email: 'test@example.com'
  }
})

if (response.card_secret) {
  const { card_key, card_token } = response.card_secret
  // 儲存以供未來使用
}
```

#### 移除卡片

從 TapPay 伺服器移除已綁定的卡片。

```typescript
await client.removeCard('card_key_123', 'card_token_123')
```

## 錯誤處理

SDK 提供具類型的錯誤類別以精確處理錯誤。所有錯誤都繼承自標準 `Error` 類別，可使用 try-catch 區塊捕獲。

### 錯誤類型

#### TapPayError
當 TapPay API 回傳錯誤回應時拋出（例如：無效的 prime、餘額不足、卡片被拒絕）。

```typescript
import { TapPayError } from 'tappay-backend-payment'

try {
  const response = await client.payByPrime({ ... })
} catch (error) {
  if (error instanceof TapPayError) {
    console.error(`API 錯誤: ${error.message}`)
    console.error(`狀態碼: ${error.status}`)
    console.error(`交易識別碼: ${error.recTradeId}`)
    
    // 檢查交易是否失敗
    if (error.isTransactionFailed) {
      // 處理失敗的交易
    }
  }
}
```

**常見的 TapPay 錯誤狀態碼：**
- `10001`: 無效的 prime
- `10002`: 無效的卡號
- `10003`: 餘額不足
- `10004`: 卡片被拒絕
- 完整清單請參閱 [TapPay 文件](https://docs.tappaysdk.com/tutorial/zh/reference.html#error-code)

#### TapPayValidationError
在發送 API 請求前，輸入驗證失敗時拋出（例如：缺少必填欄位、無效的值）。

```typescript
import { TapPayValidationError } from 'tappay-backend-payment'

try {
  await client.payByPrime({
    prime: '', // 空的 prime 會觸發驗證錯誤
    amount: 100,
  })
} catch (error) {
  if (error instanceof TapPayValidationError) {
    console.error(`驗證錯誤: ${error.message}`)
    console.error(`欄位: ${error.field}`) // 例如：'prime', 'amount'
  }
}
```

**常見的驗證錯誤：**
- 缺少必填欄位（prime、amount、currency 等）
- 必填欄位為空字串
- 無效的金額（零或負數）
- 空的交易識別碼

#### TapPayTimeoutError
當 API 請求逾時時拋出。

```typescript
import { TapPayTimeoutError } from 'tappay-backend-payment'

try {
  await client.payByPrime({ ... })
} catch (error) {
  if (error instanceof TapPayTimeoutError) {
    console.error(`請求在 ${error.timeout}ms 後逾時`)
    console.error(`端點: ${error.endpoint}`)
    
    // 考慮重試請求
  }
}
```

#### TapPayConfigError
當客戶端設定無效時拋出（例如：缺少 partner key、無效的 timeout）。

```typescript
import { TapPayConfigError } from 'tappay-backend-payment'

try {
  const client = new TapPayClient({
    partnerKey: '', // 空的 key 會觸發設定錯誤
    merchantId: 'test_merchant_id',
  })
} catch (error) {
  if (error instanceof TapPayConfigError) {
    console.error(`設定錯誤: ${error.message}`)
    console.error(`欄位: ${error.field}`) // 例如：'partnerKey', 'merchantId'
  }
}
```

### 完整的錯誤處理範例

```typescript
import {
  TapPayClient,
  TapPayError,
  TapPayConfigError,
  TapPayTimeoutError,
  TapPayValidationError,
} from 'tappay-backend-payment'

async function processPayment(prime: string, amount: number) {
  try {
    const response = await client.payByPrime({
      prime,
      amount,
      currency: Currency.TWD,
      details: '商品購買',
    })
    
    return { success: true, transactionId: response.rec_trade_id }
  } catch (error) {
    if (error instanceof TapPayValidationError) {
      // 輸入驗證失敗 - 修正輸入並重試
      console.error(`無效的輸入: ${error.field} - ${error.message}`)
      return { success: false, error: 'INVALID_INPUT', field: error.field }
    } else if (error instanceof TapPayTimeoutError) {
      // 請求逾時 - 考慮重試
      console.error(`請求逾時: ${error.endpoint}`)
      return { success: false, error: 'TIMEOUT', retryable: true }
    } else if (error instanceof TapPayError) {
      // API 回傳錯誤
      console.error(`付款失敗: ${error.message} (狀態碼: ${error.status})`)
      return {
        success: false,
        error: 'PAYMENT_FAILED',
        status: error.status,
        transactionId: error.recTradeId,
      }
    } else {
      // 未預期的錯誤
      console.error('未預期的錯誤:', error)
      return { success: false, error: 'UNKNOWN' }
    }
  }
}
```

### 錯誤處理最佳實踐

1. **總是處理錯誤**：將 API 呼叫包裝在 try-catch 區塊中
2. **檢查錯誤類型**：使用 `instanceof` 適當處理不同類型的錯誤
3. **記錄錯誤**：在日誌中包含錯誤詳情以便除錯
4. **重試逾時**：考慮在 `TapPayTimeoutError` 時重試
5. **驗證輸入**：及早捕獲 `TapPayValidationError` 以提供更好的使用者回饋

## Backend Notify

對於 3D 驗證和電子支付交易，TapPay 會 POST 到您的 `backend_notify_url`：

```typescript
import type { BackendNotifyPayload } from 'tappay-backend-payment'

// Express.js 範例
app.post('/api/notify', (req, res) => {
  const payload: BackendNotifyPayload = req.body

  if (payload.status === 0) {
    // 付款成功
    console.log(`交易 ${payload.rec_trade_id} 完成`)
  } else {
    // 付款失敗
    console.log(`交易失敗: ${payload.msg}`)
  }

  res.status(200).send('OK')
})
```

## 貨幣支援

SDK 支援多種貨幣：

```typescript
import { Currency, CurrencyMultiplier } from 'tappay-backend-payment'

Currency.TWD // 新台幣（乘數：1）
Currency.USD // 美元（乘數：100）
Currency.JPY // 日圓（乘數：1）
Currency.EUR // 歐元（乘數：100）
// ... 更多
```

> **注意**：對於乘數為 100 的貨幣，金額應乘以 100。
> 例如，USD $1.00 應傳送 `amount: 100`。

## 測試卡號

在 Sandbox 環境測試時，可使用 TapPay 的測試卡號：
- **成功**: `4242424242424242`
- **失敗**: `4111111111111111`

更多測試卡號請參閱 [TapPay 文件](https://docs.tappaysdk.com/tutorial/zh/reference.html#test-card)。

## 系統需求

- Node.js >= 18.0.0（需要原生 fetch 支援）
- TypeScript >= 5.0（開發用）

## 授權條款

MIT © Carl Lee

## 相關連結

- [TapPay 文件](https://docs.tappaysdk.com/)
- [TapPay Portal](https://www.tappaysdk.com/)
