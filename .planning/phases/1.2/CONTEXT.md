# Phase 1.2 Context: 字串驗證邏輯提取

## Goal
消除 TapPayClient.ts 中 17 處重複的字串驗證邏輯（`.trim() === ''`），提取為可重用的驗證工具函數。

## Current State
- **問題文件**: `src/TapPayClient.ts` (742 lines)
- **重複模式**: 17 處 `.trim() === ''` 驗證邏輯散佈各處
- **影響**: 違反 DRY 原則，增加維護成本，難以一致更新驗證規則

## Success Criteria
- [ ] 建立 `src/utils/validators.ts` 或類似模組
- [ ] 提取至少 5 個通用驗證函數（validateRequired, validateAmount, validateConfig, etc.)
- [ ] 所有驗證邏輯從 TapPayClient.ts 遷移至驗證模組
- [ ] 所有 123 項測試仍然通過
- [ ] 100% 測試覆蓋率維持
- [ ] 代碼重複度下降至少 30%
- [ ] 無 breaking changes（內部重構）

## Affected Files
**Primary**:
- `src/TapPayClient.ts` - 移除驗證邏輯，改為調用驗證函數
- `src/utils/validators.ts` (新建) - 集中驗證邏輯

**Secondary** (可能需要調整):
- `src/errors/` - 如果驗證器拋出新的錯誤類型
- `tests/index.test.ts` - 添加驗證函數的單元測試

## Validation Points
Based on CONCERNS.md analysis:
- Line 102-108: `.trim() === ''` 檢查 (partner_key)
- Line 260-270: `.trim() === ''` 檢查 (partner_key in payByPrime)
- Line 312-330: 多個驗證檢查
- Line 376-383: `.trim() === ''` 檢查
- Line 417-423: 驗證邏輯
- Line 456-458: 驗證邏輯
- Line 489-491: 驗證邏輯
- Line 542-548: 驗證邏輯
- 等等...

## Testing Strategy
1. 保留所有現有測試並確保通過
2. 為每個驗證函數添加單元測試
3. 驗證提取後的邏輯與原有邏輯完全相同
4. 運行完整測試套件並驗證 100% 覆蓋率

## Time Estimate
2-3 小時（包括測試和驗證）

## Risk Assessment
- **Risk Level**: 低 (純代碼重構，測試完全覆蓋)
- **Breaking Changes**: 無 (內部實現變更)
- **Rollback**: 容易 (revert commit)

## Dependencies
- **Upstream**: Phase 1.1 (已完成，TS 6.0.2 + Biome 2.4.8 可用)
- **Downstream**: Phase 1.3 (架構拆分需在驗證邏輯穩定後進行)

## Notes
- 這是典型的代碼重構，優先級中等
- 完成後可立即進行 Phase 1.3
- 建議在一個 commit 中完成所有驗證邏輯提取
