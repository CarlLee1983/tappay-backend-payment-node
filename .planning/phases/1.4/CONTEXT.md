# Phase 1.4 Context: 新增功能和測試改進

## Goal
為 SDK 新增 3 個實用工具功能，改進錯誤處理和測試覆蓋，完成里程碑目標。

### 新增功能清單

**1. Webhook 驗籤工具** (中優先級, 2-3小時)
```typescript
export function verifyTapPayWebhook(
  payload: BackendNotifyPayload,
  signature: string,
  partnerKey: string
): boolean
```
- 驗証 webhook 簽名防止重放攻擊
- 完整的使用範例和文件

**2. 重試機制工具** (低優先級, 1-2小時)
```typescript
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 100
): Promise<T>
```
- 指數退避算法
- 可配置重試次數和延遲

**3. 錯誤處理改進** (低優先級, 1小時)
```typescript
export function scrubErrorForLogging(error: TapPayError): string
```
- 移除敏感資訊的錯誤日誌
- 保留必要的除錯信息

### 測試改進

**補全錯誤測試** (中優先級, 1-2小時)
- 添加 getRecords() 錯誤情景測試
- 添加 getTransaction() 錯誤情景測試
- 添加 getTradeHistory() 錯誤情景測試

## Current State
- 所有公開 API 有測試，但交易查詢方法的錯誤情景測試不完整
- 缺少實用工具函數（webhook、retry、logging）

## Success Criteria
- [ ] 建立 `src/utils/webhooks.ts` (webhook 驗籤)
- [ ] 建立 `src/utils/retry.ts` (重試機制)
- [ ] 建立 `src/utils/errorHandling.ts` (錯誤日誌清理)
- [ ] 所有新工具函數有完整測試
- [ ] 補完交易查詢方法的錯誤測試
- [ ] 所有 183+ 項測試通過
- [ ] 100% 測試覆蓋率維持
- [ ] 無 breaking changes
- [ ] 新增功能有完整的 JSDoc 文件

## Affected Files
**Create**:
- `src/utils/webhooks.ts` - Webhook 驗籤工具
- `src/utils/retry.ts` - 重試機制工具
- `src/utils/errorHandling.ts` - 錯誤處理工具

**Modify**:
- `src/index.ts` - 導出新工具函數
- `tests/index.test.ts` - 新增 30+ 個測試

## Risk Assessment
- **Risk Level**: 低 (新增功能，無 breaking changes)
- **Breaking Changes**: 無
- **Rollback**: 容易

## Time Estimate
4-5 小時（包括所有測試）

## Testing Strategy
1. 為每個新工具函數添加單元測試
2. 添加交易查詢方法的錯誤情景測試
3. 驗證所有 183+ 項測試通過
4. 驗證 100% 測試覆蓋率

## Dependencies
- **Upstream**: Phase 1.3 (架構已穩定)
- **Downstream**: 無 (里程碑最後階段)

## Notes
- 完成後可準備發佈 v1.8.0
- 所有新功能應提供使用範例
- 應更新 README 包含新工具使用說明
