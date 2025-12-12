# npm OIDC 設定指南

## 🔴 當前問題

根據錯誤訊息：
```
npm notice Access token expired or revoked. Please try logging in again.
npm error 404 Not Found - PUT https://registry.npmjs.org/@carllee1983/tappay-backend-payment-node
```

這表示 OIDC 認證沒有正確設定。請按照以下步驟進行設定。

## 📋 設定步驟

### 步驟 1：登入 npm 網站

1. 前往：https://www.npmjs.com/
2. 使用你的 npm 帳號登入（`carllee1983`）

### 步驟 2：啟用 OIDC 可信發布

1. **前往 Trusted Publishers 設定頁面**：
   - 直接連結：https://www.npmjs.com/settings/carllee1983/trusted-publishers
   - 或從設定頁面：Settings → Access Tokens → Trusted Publishers

2. **新增 GitHub Actions 作為可信發布者**：
   - 點擊「Add Trusted Publisher」或「新增可信發布者」
   - 選擇「GitHub Actions」
   - 填寫以下資訊：
     - **Repository Owner**: `CarlLee1983`
     - **Repository Name**: `tappay-backend-payment-node` ⚠️ **重要：必須完全匹配**
     - **Workflow Filename**: `.github/workflows/release-please.yml`
     - **Environment Name**: （留空，表示使用預設環境）

3. **儲存設定**

### 步驟 3：驗證設定

確認以下設定正確：

- ✅ Repository 名稱：`CarlLee1983/tappay-backend-payment-node`
- ✅ Workflow 檔案：`.github/workflows/release-please.yml`
- ✅ npm 帳號：`carllee1983` 是套件 `@carllee1983/tappay-backend-payment-node` 的 owner

### 步驟 4：驗證套件權限

在終端機執行：

```bash
npm owner ls @carllee1983/tappay-backend-payment-node
```

應該會看到你的帳號（`carllee1983`）在列表中。

## 📧 Email 地址說明

**重要**：OIDC 認證**不依賴 email 地址**，而是基於：
- GitHub repository 的所有權
- GitHub Actions workflow 的來源
- npm Trusted Publishers 設定

因此，即使 npm 帳號的 email（`carllee0520@gmail.com`）與 GitHub 帳號的 email（`yashino538@gmail.com`）不同，**也不會影響 OIDC 認證**。

不過，為了保持一致性，建議：
- 在 npm 帳號設定中確認 email 已驗證
- 確認 GitHub 帳號的 email 已驗證
- 兩個 email 都可以正常接收通知

## 🔍 常見問題排查

### 問題 1：`Access token expired or revoked`

**可能原因**：
1. npm 帳號沒有啟用 OIDC 可信發布
2. Repository 名稱在 npm 設定中不匹配
3. Workflow 檔案路徑不正確

**解決方法**：
1. 確認已在 npm 網站啟用 OIDC 可信發布（見步驟 2）
2. 確認 Repository 名稱完全匹配：`CarlLee1983/tappay-backend-payment-node`
3. 確認 Workflow 檔案路徑：`.github/workflows/release-please.yml`

### 問題 2：`404 Not Found`

**可能原因**：
1. OIDC 認證失敗，導致 npm 無法識別你的身份
2. 套件權限問題

**解決方法**：
1. 先解決 OIDC 認證問題（見問題 1）
2. 確認你是套件的 owner：
   ```bash
   npm owner ls @carllee1983/tappay-backend-payment-node
   ```

### 問題 3：Repository 名稱不匹配

**重要**：npm OIDC 會嚴格驗證 repository 名稱，必須與以下完全匹配：

- GitHub Repository: `CarlLee1983/tappay-backend-payment-node`
- npm 設定中的 Repository: `CarlLee1983/tappay-backend-payment-node`
- `package.json` 中的 `repository.url`: `git+https://github.com/CarlLee1983/tappay-backend-payment-node.git`

## 📝 驗證 OIDC 設定

### 方法 1：檢查 npm 設定

1. 前往：https://www.npmjs.com/settings/carllee1983/trusted-publishers
2. 確認是否有設定 GitHub Actions 可信發布者
3. 確認 Repository 名稱正確

### 方法 2：檢查 GitHub Actions 權限

確認 `.github/workflows/release-please.yml` 中的 `publish` job 有設定：

```yaml
permissions:
  contents: read
  id-token: write  # 必須設定此權限
```

### 方法 3：測試發布

1. Push 一個新的 release commit 或 feat commit
2. 監控 GitHub Actions 執行結果
3. 檢查 `npm whoami` 步驟是否成功

## 🔗 相關連結

- npm Trusted Publishers：https://www.npmjs.com/settings/carllee1983/trusted-publishers
- npm Package：https://www.npmjs.com/package/@carllee1983/tappay-backend-payment-node
- GitHub Actions：https://github.com/CarlLee1983/tappay-backend-payment-node/actions
- npm 設定頁面：https://www.npmjs.com/settings/carllee1983

## ⚠️ 重要提醒

1. **Repository 名稱必須完全匹配**：`CarlLee1983/tappay-backend-payment-node`
2. **Workflow 檔案路徑必須正確**：`.github/workflows/release-please.yml`
3. **必須在 npm 網站上手動啟用 OIDC**：GitHub Actions 配置無法自動啟用
4. **確認你是套件的 owner**：使用 `npm owner ls` 檢查

## 🆘 如果仍然失敗

如果按照以上步驟設定後仍然失敗，請檢查：

1. **GitHub Actions 日誌**：
   - 前往：https://github.com/CarlLee1983/tappay-backend-payment-node/actions
   - 查看 `publish` job 的詳細日誌
   - 特別注意 `npm whoami` 步驟的輸出

2. **npm 帳號狀態**：
   - 確認電子郵件已驗證
   - 確認帳號沒有被限制

3. **套件狀態**：
   - 確認套件在 npm 上存在
   - 確認版本號沒有重複

