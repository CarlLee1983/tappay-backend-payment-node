# 手動發布 1.3.0 版本指南

## 📋 發布前確認

### 1. 確認套件設定

- ✅ 套件名稱：`@carllee1983/tappay-backend-payment-node`
- ✅ 版本號：`1.3.0`
- ✅ `publishConfig.access`: `public`
- ✅ `repository.url`: `git+https://github.com/CarlLee1983/tappay-backend-payment-node.git`

### 2. 確認已登入 npm

```bash
npm whoami
```

應該顯示：`carllee1983`

如果沒有登入，請執行：
```bash
npm login
```

### 3. 確認建置完成

```bash
# 如果需要重新建置
bun run build
```

## 🚀 手動發布步驟

### 步驟 1：執行測試和建置（可選，但建議）

```bash
# 執行測試
bun run test:ci

# 建置套件
bun run build
```

### 步驟 2：預覽發布內容（可選）

```bash
npm publish --dry-run --access public
```

這會顯示將要發布的檔案，但不會實際發布。

### 步驟 3：發布套件

```bash
npm publish --access public
```

**重要**：
- 首次發布 scoped package 時，必須明確指定 `--access public`
- 即使 `package.json` 中已設定 `publishConfig.access: "public"`，也建議加上此參數

### 步驟 4：驗證發布結果

發布成功後，可以驗證：

```bash
npm view @carllee1983/tappay-backend-payment-node
```

或前往 npm 網站查看：
https://www.npmjs.com/package/@carllee1983/tappay-backend-payment-node

## 🔐 OIDC 設定步驟

發布成功後，需要設定 OIDC 以啟用 GitHub Actions 自動發布。

### 步驟 1：前往 npm Trusted Publishers 設定

1. **登入 npm 網站**：https://www.npmjs.com/
2. **前往 Trusted Publishers 設定頁面**：
   - 直接連結：https://www.npmjs.com/settings/carllee1983/trusted-publishers
   - 或從設定頁面：Settings → Access Tokens → Trusted Publishers

### 步驟 2：新增 GitHub Actions 作為可信發布者

1. 點擊「Add Trusted Publisher」或「新增可信發布者」
2. 選擇「GitHub Actions」
3. 填寫以下資訊：
   - **Repository Owner**: `CarlLee1983`
   - **Repository Name**: `tappay-backend-payment-node` ⚠️ **必須完全匹配**
   - **Workflow Filename**: `.github/workflows/release-please.yml`
   - **Environment Name**: （留空，表示使用預設環境）
4. 點擊「Save」或「儲存」

### 步驟 3：驗證 OIDC 設定

設定完成後，可以透過以下方式驗證：

1. **Push 一個新的 commit** 觸發 GitHub Actions
2. **監控 GitHub Actions 執行**：
   - 前往：https://github.com/CarlLee1983/tappay-backend-payment-node/actions
   - 查看 `Release Please` workflow 執行結果
3. **檢查 `npm whoami` 步驟**：
   - 如果 OIDC 設定正確，應該會顯示 `carllee1983`
   - 如果失敗，會顯示詳細的錯誤訊息

## ✅ 完成後的狀態

手動發布和 OIDC 設定完成後：

1. ✅ 套件 `@carllee1983/tappay-backend-payment-node@1.3.0` 已在 npm 上
2. ✅ OIDC 可信發布已設定
3. ✅ GitHub Actions 可以自動發布新版本
4. ✅ 之後的版本更新會由 release-please 自動處理

## 🔗 相關連結

- npm 套件頁面：https://www.npmjs.com/package/@carllee1983/tappay-backend-payment-node
- npm Trusted Publishers：https://www.npmjs.com/settings/carllee1983/trusted-publishers
- GitHub Actions：https://github.com/CarlLee1983/tappay-backend-payment-node/actions
- OIDC 設定指南：`.github/OIDC_SETUP.md`

## ⚠️ 注意事項

1. **首次發布**：這是全新的套件名稱，首次發布需要手動執行
2. **OIDC 設定**：必須在 npm 網站上手動設定，GitHub Actions 無法自動完成
3. **Repository 名稱**：OIDC 設定中的 Repository 名稱必須完全匹配：`tappay-backend-payment-node`
4. **Workflow 檔案路徑**：必須是 `.github/workflows/release-please.yml`

