# 編碼慣例

**分析日期：** 2026-03-24

## 命名慣例

### 檔案名稱

- **類別檔案（Class）：** PascalCase（大駝峰）
  - 範例：`TapPayClient.ts`、`PaymentRequest.ts`、`PaymentResponse.ts`
  - 每個類別/interface 專用檔案

- **樞紐檔案（Barrel/Index）：** `index.ts`
  - 用於重新匯出所有公開 API
  - 位置：`src/index.ts`，結構化的分組匯出

- **常數/枚舉檔案：** PascalCase
  - 範例：`Env.ts`、`Currency.ts`、`CardType.ts`

- **類型檔案：** PascalCase
  - 範例：`TapPayConfig.ts`、`CardInfo.ts`、`ResultUrl.ts`

- **測試檔案：** `{name}.test.ts` 或 `{name}.spec.ts`
  - 範例：`index.test.ts`
  - 使用 Bun test runner 內建的測試命名

### 函數名稱

- **方法：** camelCase（小駝峰）
  - 範例：`payByPrime()`、`payByToken()`、`refund()`、`cancelRefund()`、`capToday()`、`cancelCapture()`、`bindCard()`、`removeCard()`、`getRecords()`、`getTransaction()`、`getTradeHistory()`

- **私有方法：** 以 `private` 修飾符 + camelCase
  - 範例：`validateConfig()`、`sendRequest()`

- **取值器（Getters）：** camelCase property 名稱
  - 範例：`get environment()`、`get isSandbox`、`get merchantId`

- **驗證工具函數：** `get{TypeName}Name()`
  - 範例：`getCardTypeName(type: CardType): string`

### 變數名稱

- **本地變數：** camelCase
  - 範例：`timeoutId`、`mockFetch`、`client`、`response`、`recTradeId`

- **常數：** UPPER_SNAKE_CASE（全大寫下劃線分隔）
  - 範例：`DEFAULT_TIMEOUT = 30000`

- **配置物件：** camelCase
  - 範例：`config`、`options`、`body`

- **私有欄位（Private Fields）：** camelCase with `private readonly`
  - 範例：`private readonly config: Required<TapPayConfig>`

### 型別名稱

- **Interface：** PascalCase，以業務概念命名
  - 範例：
    - `TapPayConfig`、`PaymentResponse`、`PaymentRequest`
    - `PayByPrimeRequest`、`PayByTokenRequest`
    - `CardInfo`、`CardSecret`、`Cardholder`
    - `TapPayBaseResponse`、`RefundResponse`

- **Type Aliases（型別別名）：** PascalCase
  - 範例：`type Env = (typeof Env)[keyof typeof Env]`
  - 範例：`type Currency = (typeof Currency)[keyof typeof Currency]`

- **Enum-like 常數：** PascalCase（大駝峰）
  - 範例：`CardType`、`Currency`

## 代碼風格

### 格式化工具

- **主要工具：** Biome v2.3.8（取代 ESLint 和 Prettier）
- **設定檔案：** `biome.json`
- **行寬：** 100 字符
- **縮排：** 2 空格
- **分號：** asNeeded（除非必要）
- **引號：** Single quotes（單引號）

### 執行命令

```bash
# 檢查並修復代碼
bun run format          # 格式化檔案
bun run lint:fix        # 修復 linting 問題
bun run check:fix       # 執行 Biome check --write
bun run typecheck       # TypeScript 型別檢查
```

### 型別檢查設定

**TypeScript 嚴格模式已完全啟用：**

```json
{
  "strict": true,
  "verbatimModuleSyntax": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "forceConsistentCasingInFileNames": true
}
```

**含義：**
- 所有變數和參數必須有明確的型別
- 沒有隱含的 `any` 型別
- 所有函數必須有明確的返回型別
- 使用 `const` 而非 `let`（Biome 規則）
- 不允許未使用的局部變數或參數

## 匯入組織

### 匯入順序

1. **Biome `organizeImports` 自動管理**，以下為觀察到的順序：

```typescript
// 1. 類型匯入（同一檔案的相對匯入）
import type { Env } from './config/Env'
import type { TapPayConfig } from './config/TapPayConfig'

// 2. 值匯入（一般匯入）
import { Env } from './config/Env'
import { TapPayConfigError } from './errors/TapPayConfigError'

// 3. 大括號分組匯入（多個相關項目）
import type {
  BindCardRequest,
  PayByPrimeRequest,
  PayByTokenRequest,
} from './payments/PaymentRequest'
```

### 路徑別名

- **基礎路徑：** 從 `src/` 開始使用相對匯入
  - 無設定的路徑別名（例如 `@/`）
  - 所有匯入都使用相對路徑（`./`）

### 重新匯出模式

`src/index.ts` 使用結構化分組：

```typescript
// ============================================================================
// Configuration
// ============================================================================
export { Env } from './config/Env'
export type { TapPayConfig } from './config/TapPayConfig'

// ============================================================================
// Domain Types
// ============================================================================
export type { CardInfo, CardSecret } from './domain/CardInfo'

// ============================================================================
// Errors
// ============================================================================
export { TapPayConfigError } from './errors/TapPayConfigError'
```

## 錯誤處理

### 錯誤類別結構

所有錯誤都繼承自 `Error` 並使用自訂 Error 類別：

**`src/errors/TapPayError.ts`**（基礎類別）：
- 儲存 `status: number`（TapPay API 狀態碼）
- 儲存 `recTradeId?: string`（交易 ID，如果可用）
- 儲存 `response?: unknown`（原始回應資料）
- 提供靜態方法 `fromResponse(response: {...}): TapPayError`
- Getter `get isTransactionFailed(): boolean` 檢查 `status !== 0`

**衍生類別：**
- `TapPayConfigError`：配置驗證失敗時拋出，儲存 `field?: string`
- `TapPayValidationError`：API 呼叫前的輸入驗證失敗，儲存 `field?: string`
- `TapPayTimeoutError`：請求超時，儲存 `timeout: number` 和 `endpoint: string`

### 錯誤拋出模式

**配置驗證（建構子）：**
```typescript
private validateConfig(config: TapPayConfig): void {
  if (!config.partnerKey || config.partnerKey.trim() === '') {
    throw new TapPayConfigError('Partner Key is required', 'partnerKey')
  }
}
```

**API 呼叫前驗證：**
```typescript
if (!options.prime || options.prime.trim() === '') {
  throw new TapPayValidationError('Prime is required', 'prime')
}
```

**API 回應錯誤：**
```typescript
if (data.status !== 0) {
  throw TapPayError.fromResponse(data as TapPayBaseResponse)
}
```

**網路/超時錯誤：**
```typescript
try {
  // ...
} catch (error) {
  if (error instanceof TapPayError) {
    throw error  // 重新拋出 TapPay 錯誤
  }
  if (error instanceof Error && error.name === 'AbortError') {
    throw new TapPayTimeoutError(...)
  }
  // 其他錯誤
}
```

## 日誌記錄

**原則：** 不使用 `console.log()` 在生產代碼中

- **Biome 規則 `noConsoleCommentText`：** error（嚴格禁止）
- **測試中可以使用：** `console.log()` 僅在測試檔案中使用
- **錯誤詳情：** 透過自訂錯誤類別傳遞，非日誌記錄

## 註釋慣例

### JSDoc/TSDoc 風格

**完整的 JSDoc 註釋應包含：**

1. **描述：** 清楚的中文或英文說明
2. **@param：** 每個參數的文件（含型別和說明）
3. **@returns：** 返回值的文件（含型別和說明）
4. **@throws：** 可能拋出的錯誤
5. **@example：** 使用範例（TypeScript 代碼區塊）

**範例：**
```typescript
/**
 * 使用 Prime Token 付款
 *
 * 使用前端 SDK 產生的 prime token 進行付款。
 * 每個 prime token 只能使用一次，有效期限為 90 秒。
 *
 * @param options - 付款選項（不包含 partner_key 和 merchant_id）
 * @returns Promise 解析為付款回應
 * @throws {TapPayValidationError} 當必要欄位缺失或無效時
 * @throws {TapPayError} 當 API 回應錯誤時
 * @throws {TapPayTimeoutError} 當請求超時時
 *
 * @example
 * ```typescript
 * const response = await client.payByPrime({
 *   prime: 'test_prime_123',
 *   amount: 100,
 *   currency: Currency.TWD,
 *   details: 'Test Payment'
 * })
 * ```
 */
```

### 內聯註釋

**使用情景：**
- 複雜邏輯的澄清
- 暫時性解決方案的說明（但不使用 FIXME/TODO）
- 微妙的錯誤處理（例如錯誤恢復）

**範例：**
```typescript
// Handle HTTP errors with better error message extraction
if (!response.ok) {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`
  try {
    const errorText = await response.text()
    // ...
  }
}

// Ignore errors when reading response, use default message
```

## 函數設計

### 大小和複雜性

- **目標行數：** 少於 50 行（強制最多 100 行）
- **巢狀深度：** 最多 4 層
- **圈環複雜度：** 盡可能低（< 10）

**範例（合規）：** `sendRequest()` = 95 行，包含詳細的錯誤處理

### 參數設計

- **位置參數：** 最多 2-3 個，否則使用物件參數
- **物件參數模式：**
  ```typescript
  async payByPrime(
    options: Omit<PayByPrimeRequest, 'partner_key' | 'merchant_id'>
  ): Promise<PaymentResponse>
  ```

- **泛型用法（適度）：**
  ```typescript
  private async sendRequest<T extends TapPayBaseResponse>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T>
  ```

### 返回值

- **明確的返回型別，不依賴推導**
  ```typescript
  async payByPrime(...): Promise<PaymentResponse>
  async getTransaction(...): Promise<TradeRecord | null>
  ```

- **使用 nullish coalescing（??）和 optional chaining（?.）**
  ```typescript
  return response.trade_records?.[0] ?? null
  ```

## 模組設計

### 檔案組織

**按域/功能分組，而非按類型：**

```
src/
├── config/          # 配置相關
│   ├── Env.ts
│   └── TapPayConfig.ts
├── domain/          # 領域模型
│   ├── Cardholder.ts
│   ├── CardInfo.ts
│   └── ResultUrl.ts
├── enums/           # 常數和枚舉
│   ├── CardType.ts
│   └── Currency.ts
├── errors/          # 自訂錯誤類別
│   ├── TapPayError.ts
│   ├── TapPayConfigError.ts
│   ├── TapPayTimeoutError.ts
│   └── TapPayValidationError.ts
├── payments/        # 支付 API 相關
│   ├── PaymentRequest.ts
│   └── PaymentResponse.ts
├── TapPayClient.ts  # 主要客戶端
└── index.ts         # 公開 API 入口
```

### 樞紐檔案（Barrel Exports）

**`src/index.ts`：** 對外唯一公開入口

- 重新匯出所有公開的型別和值
- 分組註釋清楚地標示各個區段
- 使用 `export type { ... }` 匯出型別（TypeScript 最佳實踐）
- 隱藏內部實現細節

**匯出內容：**
- Configuration：`Env`、`TapPayConfig`
- Domain Types：`Cardholder`、`CardInfo`、`CardSecret`、`ResultUrl`
- Enums：`CardType`、`Currency`、`CurrencyMultiplier`、`getCardTypeName()`
- Errors：所有自訂錯誤類別
- Request Types：所有 API 請求介面
- Response Types：所有 API 回應介面
- Core：`TapPayClient`
- Metadata：`VERSION`

### 單一職責原則

**檔案職責清楚：**
- `TapPayClient.ts`：API 呼叫協調、驗證、錯誤處理
- `PaymentRequest.ts`：所有請求介面定義
- `PaymentResponse.ts`：所有回應介面定義
- Error 檔案：單一錯誤類別
- Enum 檔案：常數定義和轉換函數

## 特殊約定

### 約定俗成的物件轉換

**蛇形命名法（snake_case）用於 API 欄位名稱：**
```typescript
// API 欄位使用蛇形
interface PayByPrimeRequest {
  partner_key: string
  merchant_id: string
  three_domain_secure?: boolean
  delay_capture_in_days?: number
}

// 函數參數/本地變數使用駝峰
async payByPrime(options: Omit<PayByPrimeRequest, ...>)
```

### 不可變性（Immutability）

- **遵循 TypeScript 的 `readonly` 修飾符**
  ```typescript
  private readonly config: Required<TapPayConfig>
  readonly status: number
  readonly recTradeId: string | undefined
  ```

- **物件傳播而非修改**
  ```typescript
  const body: PayByPrimeRequest = {
    ...options,
    partner_key: this.config.partnerKey,
    merchant_id: this.config.merchantId,
  }
  ```

### 超時處理

**明確的超時管理：**
```typescript
const DEFAULT_TIMEOUT = 30000  // 30 秒
const controller = new AbortController()
let timeoutId: ReturnType<typeof setTimeout> | undefined

try {
  timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
  // 執行請求
} finally {
  if (timeoutId) {
    clearTimeout(timeoutId)  // 確保清理
  }
}
```

---

*編碼慣例分析：2026-03-24*
