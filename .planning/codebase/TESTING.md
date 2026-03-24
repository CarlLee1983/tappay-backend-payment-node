# 測試模式

**分析日期：** 2026-03-24

## 測試框架

### 執行器

- **測試框架：** Bun test（v1.3.10+）
- **設定檔案：** 無（Bun 內建支援，無需配置）
- **斷言庫：** Bun test 內建（`expect()`）

### 執行命令

```bash
# 執行所有測試
bun test

# 測試監視模式（持續執行）
bun test --watch

# 測試覆蓋率
bun test --coverage

# CI 環境（要求 100% 覆蓋率）
bun test --coverage --coverage-threshold=100
```

### 覆蓋率要求

- **CI 設定：** `--coverage-threshold=100`
- **目標：** 100% 代碼覆蓋率
- **預發布檢查：** `bun run test:ci` 必須通過

## 測試檔案組織

### 位置和命名

**位置：** `tests/` 目錄（與 `src/` 同級）

**命名模式：** `{name}.test.ts`
- 主要測試：`tests/index.test.ts`
- 無須為每個源檔案建立對應測試檔（單一測試檔案策略）

**當前結構：**
```
tests/
└── index.test.ts         # 所有測試集中在此
```

### 測試檔案大小

- **主要測試檔：** 1204 行
- **組織方式：** 使用 `describe()` 深度巢狀分組，而非多個檔案
- **優勢：** 便於共享 setup/teardown，測試隔離清晰

## 測試結構

### 測試套件組織

**頂層結構：**
```typescript
describe('TapPay Backend Payment SDK', () => {
  describe('VERSION', () => { /* ... */ })
  describe('Env', () => { /* ... */ })
  describe('Currency', () => { /* ... */ })
  describe('CardType', () => { /* ... */ })
  describe('TapPayClient', () => { /* ... */ })
})
```

### 測試案例模式

**典型測試案例：**
```typescript
it('should create client with valid config', () => {
  const client = new TapPayClient({
    partnerKey: 'test_partner_key',
    merchantId: 'test_merchant_id',
  })

  expect(client).toBeInstanceOf(TapPayClient)
  expect(client.isSandbox).toBe(true)
  expect(client.merchantId).toBe('test_merchant_id')
})
```

**異步測試案例：**
```typescript
it('should throw TapPayError on API error response', async () => {
  mockFetch.mockImplementation(() =>
    Promise.resolve(createMockResponse({ status: 10001, msg: 'Invalid prime' }))
  )

  await expect(
    client.payByPrime({
      prime: 'invalid_prime',
      amount: 100,
      details: 'Test Payment',
    })
  ).rejects.toThrow(TapPayError)
})
```

### Setup 和 Teardown

**全局 Mock 管理：**
```typescript
const originalFetch = globalThis.fetch

beforeEach(() => {
  mockFetch = mock(() =>
    Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
  )
  globalThis.fetch = mockFetch as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})
```

**助手函數：**
```typescript
const createMockResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  text: () => Promise.resolve(JSON.stringify(data)),
  json: () => Promise.resolve(data),
})
```

## Mock 和 Fixtures

### Mock 工具

**使用 Bun test 的 `mock()` 函數：**
```typescript
import { mock } from 'bun:test'

mockFetch = mock(() => Promise.resolve(createMockResponse({ ... })))
```

**Mock 驗證：**
```typescript
expect(mockFetch).toHaveBeenCalledTimes(1)
const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
expect(url).toBe('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime')
```

### 什麼應該被 Mock

**必須 Mock：**
- `globalThis.fetch` - 所有 HTTP 呼叫
- 網路相關的功能（超時、錯誤等）
- 外部 API 呼叫

**不應 Mock：**
- 本地驗證邏輯
- 自訂錯誤類別的建立
- 配置管理
- 枚舉和常數轉換

### 測試數據模式

**直接內聯建立：**
```typescript
const client = new TapPayClient({
  partnerKey: 'test_partner_key',
  merchantId: 'test_merchant_id',
  timeout: 100,
})

const response = await client.payByPrime({
  prime: 'test_prime',
  amount: 100,
  details: 'Test Payment',
  cardholder: {
    phone_number: '+886912345678',
    name: 'Test User',
    email: 'test@example.com',
  },
})
```

**無專用 Fixture 檔案（內聯策略）**
- 測試數據簡單，直接在測試中定義
- 便於理解每個測試的前提條件
- 避免檔案分散

## 覆蓋率和測試類型

### 當前覆蓋率

- **運行統計：** 123 測試通過，0 失敗
- **預期通過：** `bun test --coverage --coverage-threshold=100`
- **期望結果：** 100% 代碼覆蓋率

### 測試類型分佈

**單元測試（~60%）：**
- 枚舉/常數驗證（Env、Currency、CardType）
- 錯誤類別驗證（TapPayError、TapPayConfigError、等）
- 配置驗證（TapPayClient 建構子）
- Helper 函數（getCardTypeName）

**整合測試（~35%）：**
- API 方法端點驗證（payByPrime、payByToken、refund、等）
- 請求體驗證（partner_key、merchant_id 包含）
- 回應解析
- Mock fetch 互動

**錯誤處理測試（~5%）：**
- HTTP 錯誤響應（非 200 狀態碼）
- 超時錯誤（AbortError）
- 網路錯誤
- JSON 解析失敗
- 空回應

## 常見測試模式

### 異步測試（Promise）

```typescript
it('should throw TapPayTimeoutError on timeout', async () => {
  globalThis.fetch = (() =>
    new Promise((_, reject) => {
      const error = new Error('AbortError')
      error.name = 'AbortError'
      setTimeout(() => reject(error), 150)
    })) as unknown as typeof fetch

  await expect(
    client.payByPrime({
      prime: 'test_prime',
      amount: 100,
      details: 'Test Payment',
    })
  ).rejects.toThrow(TapPayTimeoutError)
})
```

### 錯誤驗證

**拋出特定錯誤類型：**
```typescript
it('should throw TapPayValidationError for empty prime', async () => {
  await expect(
    client.payByPrime({
      prime: '',
      amount: 100,
      details: 'Test Payment',
    })
  ).rejects.toThrow(TapPayValidationError)
})
```

**檢查錯誤屬性：**
```typescript
try {
  await client.payByPrime({ /* ... */ })
} catch (error) {
  expect(error).toBeInstanceOf(TapPayError)
  expect((error as TapPayError).recTradeId).toBe('D20231201123456789')
  expect((error as TapPayError).status).toBe(10001)
}
```

### 配置驗證測試

```typescript
describe('constructor', () => {
  it('should throw TapPayConfigError for missing partnerKey', () => {
    expect(() => {
      new TapPayClient({
        partnerKey: '',
        merchantId: 'test_merchant_id',
      })
    }).toThrow(TapPayConfigError)
  })

  it('should throw TapPayConfigError for whitespace-only partnerKey', () => {
    expect(() => {
      new TapPayClient({
        partnerKey: '   ',
        merchantId: 'test_merchant_id',
      })
    }).toThrow(TapPayConfigError)
  })

  it('should throw TapPayConfigError for invalid timeout (zero)', () => {
    expect(() => {
      new TapPayClient({
        partnerKey: 'test_partner_key',
        merchantId: 'test_merchant_id',
        timeout: 0,
      })
    }).toThrow(TapPayConfigError)
  })
})
```

### HTTP 和網路錯誤測試

```typescript
it('should throw TapPayError on HTTP error', async () => {
  mockFetch.mockImplementation(() =>
    Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    })
  )

  await expect(
    client.payByPrime({
      prime: 'test_prime',
      amount: 100,
      details: 'Test Payment',
    })
  ).rejects.toThrow(TapPayError)
})

it('should extract error message from HTTP error response', async () => {
  globalThis.fetch = (() =>
    Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(JSON.stringify({ msg: 'Server error message' })),
    })) as unknown as typeof fetch

  try {
    await client.payByPrime({
      prime: 'test_prime',
      amount: 100,
      details: 'Test Payment',
    })
  } catch (error) {
    expect(error).toBeInstanceOf(TapPayError)
    expect((error as TapPayError).message).toContain('Server error message')
  }
})
```

### API 方法端點驗證

**驗證正確的端點和 HTTP 方法：**
```typescript
it('should call correct endpoint', async () => {
  mockFetch.mockImplementation(() =>
    Promise.resolve(
      createMockResponse({
        status: 0,
        msg: 'Success',
        rec_trade_id: 'D20231201123456789',
      })
    )
  )

  await client.payByPrime({
    prime: 'test_prime',
    amount: 100,
    details: 'Test Payment',
  })

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
  expect(url).toBe('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime')
  expect(options.method).toBe('POST')
  expect(options.headers).toEqual({
    'Content-Type': 'application/json',
    'x-api-key': 'test_partner_key',
  })
})
```

**驗證請求體：**
```typescript
it('should include partner_key and merchant_id in request body', async () => {
  mockFetch.mockImplementation(() =>
    Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
  )

  await client.payByPrime({
    prime: 'test_prime',
    amount: 100,
    details: 'Test Payment',
  })

  const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
  const body = JSON.parse(options.body as string)
  expect(body.partner_key).toBe('test_partner_key')
  expect(body.merchant_id).toBe('test_merchant_id')
  expect(body.prime).toBe('test_prime')
  expect(body.amount).toBe(100)
})
```

## 測試統計

### 當前覆蓋

**總計：123 個測試**

**按類別分佈：**
- VERSION：2 個測試
- Env：3 個測試
- Currency：13 個測試（包含 CurrencyMultiplier）
- CardType：5 個測試（包含 getCardTypeName）
- TapPayClient constructor：10 個測試
- TapPayClient 方法存在性：11 個測試
- TapPayClient getters：3 個測試
- API 呼叫（模擬 fetch）：~40 個測試
- 錯誤處理：~15 個測試
- 輸入驗證：~6 個測試

### 測試執行時間

- **總耗時：** ~163ms（在 Bun 中）
- **預期：** 快速（< 500ms）
- **在 CI 環境中：** 應仍保持快速

## 預發布檢查清單

在發布前，`package.json` 中定義的 `prepublishOnly` 腳本會執行：

```bash
bun run typecheck && bun run check && bun run test:ci && bun run build
```

**順序：**
1. **TypeScript 型別檢查** - 無類型錯誤
2. **Biome check** - 代碼風格和格式
3. **測試（100% 覆蓋率）** - 所有測試通過
4. **構建** - 編譯 TypeScript 為 CJS 和 ESM

## 測試檔案關鍵部分

### 導入

```typescript
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import packageJson from '../package.json'
import {
  CardType,
  Currency,
  CurrencyMultiplier,
  Env,
  getCardTypeName,
  TapPayClient,
  TapPayConfigError,
  TapPayError,
  TapPayTimeoutError,
  TapPayValidationError,
  VERSION,
} from '../src'
```

### 常用斷言

```typescript
expect(value).toBe(expected)                    // 值相等
expect(value).toEqual(expected)                 // 深層相等
expect(value).toBeInstanceOf(Class)             // instanceof 檢查
expect(value).toBeNull()                        // null 檢查
expect(value).not.toBeNull()                    // not null 檢查
expect(array).toHaveLength(n)                   # 陣列長度
expect(func).toThrow(ErrorClass)                # 同步拋出
expect(async).rejects.toThrow(ErrorClass)       # 非同步拋出
expect(mockFn).toHaveBeenCalledTimes(n)         # Mock 呼叫計數
expect(mockFn.mock.calls[0]).toEqual([...])     # Mock 呼叫參數
```

---

*測試分析：2026-03-24*
