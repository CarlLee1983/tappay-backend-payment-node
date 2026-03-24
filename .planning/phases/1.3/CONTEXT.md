# Phase 1.3 Context: TapPayClient 架構拆分

## Goal
拆分 TapPayClient.ts（742 行，11 個公開異步方法）為 3 個單一職責 Service 類別：
- PaymentService（支付相關操作）
- TransactionService（交易管理操作）
- CardService（卡片管理操作）

## Current State
- **文件**: `src/TapPayClient.ts` (742 lines)
- **方法數**: 11 個公開異步方法
- **問題**: 混雜支付、交易、卡片管理的關注點，違反 SRP
- **影響**: 難以測試個別關注點，新增 API 方法風險高，可讀性差

## Proposed Architecture

### 原有結構
```
TapPayClient (742 lines)
├── Payment methods (payByPrime, payByToken)
├── Transaction methods (refund, capToday, cancelCapture)
└── Card methods (bindCard, removeCard, unbindCard)
```

### 新架構
```
TapPayClient (facade, ~150 lines)
├── PaymentService (支付操作)
│   ├── payByPrime()
│   └── payByToken()
├── TransactionService (交易管理)
│   ├── refund()
│   ├── capToday()
│   ├── cancelCapture()
│   ├── getRecords()
│   └── getTransaction()
└── CardService (卡片管理)
    ├── bindCard()
    ├── removeCard()
    ├── unbindCard()
    └── getTradeHistory()
```

## Success Criteria
- [ ] 建立 PaymentService、TransactionService、CardService (3 個新文件)
- [ ] TapPayClient 改為 Facade 模式，保持 public API 相容
- [ ] 原有 11 個方法保留，行為無改變
- [ ] 所有 123+ 項測試仍然通過
- [ ] 100% 測試覆蓋率維持
- [ ] TypeScript 嚴格模式無警告
- [ ] 無 breaking changes（完整向後相容）

## Affected Files
**Create**:
- `src/services/PaymentService.ts`
- `src/services/TransactionService.ts`
- `src/services/CardService.ts`

**Modify**:
- `src/TapPayClient.ts` - 改為 Facade，委派至各 Service
- `src/index.ts` - 導出新的 Service 類別（可選，保持向後相容）
- `tests/index.test.ts` - 可能需要調整測試結構

## Dependency Impact
- **Upstream**: Phase 1.2（驗證邏輯已提取，TapPayClient 更乾淨）
- **Downstream**: Phase 1.4（新增功能後進行）

## Risk Assessment
- **Risk Level**: 中等 (改變內部架構，但保持 public API)
- **Breaking Changes**: 無（完整向後相容）
- **Rollback**: 容易 (revert commits)
- **Testing**: 需完整測試確保行為相同

## Time Estimate
4-6 小時（包括完整測試和驗證）

## Testing Strategy
1. 保留所有現有測試並確保通過
2. 可選：為每個 Service 添加單元測試
3. 驗證 Facade 正確委派
4. 運行完整測試套件並驗證 100% 覆蓋率
5. 驗證無 breaking changes

## Notes
- 這是重要的架構改進，提升代碼可維護性
- 實現後更容易新增新的支付方法或交易功能
- Service 隔離有助於未來的並行開發
