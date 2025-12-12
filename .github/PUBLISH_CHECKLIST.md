# npm Publish 檢查清單

## ✅ 已完成的配置

- [x] `package.json` 中的 `repository.url` 已與實際 git remote 一致
- [x] GitHub Actions 工作流程已配置 OIDC 認證
- [x] `id-token: write` 權限已設定
- [x] `setup-node@v4` 已正確配置 `registry-url`

## 🔍 需要確認的 npm 設定

### 1. 確認 npm OIDC 設定

請前往 npm 網站確認以下設定：

1. **登入 npm 網站**：https://www.npmjs.com/
2. **前往 Access Tokens 設定**：https://www.npmjs.com/settings/carllee1983/tokens
3. **確認「Automation」或「Publish」類型的 token 設定**
4. **檢查「Trusted Publishers」設定**：
   - 前往：https://www.npmjs.com/settings/carllee1983/trusted-publishers
   - 確認是否有設定 GitHub Actions 作為可信發布者
   - Repository 名稱必須是：`CarlLee1983/tappay-backend-payment-node`

### 2. 驗證套件權限

確認你的 npm 帳號（`carllee1983`）是 `@carllee1983/tappay-backend-payment` 套件的 owner：

```bash
npm owner ls @carllee1983/tappay-backend-payment
```

應該會看到你的帳號在列表中。

### 3. 測試發布流程

當你 push 這個 release commit 後，GitHub Actions 會自動：

1. 執行 `release-please` 建立 release
2. 觸發 `publish` job
3. 使用 OIDC 認證到 npm
4. 發布套件到 npm registry

## 🚨 常見問題

### 問題 1：`Access token expired or revoked`

**原因**：OIDC 認證未正確設定或 npm 帳號未啟用 OIDC

**解決方法**：
1. 確認 npm 帳號已啟用 OIDC 可信發布
2. 確認 GitHub Actions 的 `id-token: write` 權限已設定
3. 確認 repository 名稱在 npm 設定中正確

### 問題 2：`404 Not Found - PUT https://registry.npmjs.org/@carllee1983/tappay-backend-payment`

**原因**：
- 套件名稱不存在（首次發布需要手動建立）
- 或權限不足

**解決方法**：
- 如果是首次發布，可能需要先在 npm 網站手動建立套件
- 確認帳號是套件的 owner

### 問題 3：Repository 名稱不匹配

**原因**：npm OIDC 設定中的 repository 名稱與實際 GitHub repository 不一致

**解決方法**：
- 確認 npm 設定中的 repository 是：`CarlLee1983/tappay-backend-payment-node`
- 確認 `package.json` 中的 `repository.url` 是：`git+https://github.com/CarlLee1983/tappay-backend-payment-node.git`

## 📝 驗證步驟

1. **Push release commit**：
   ```bash
   git push origin main
   ```

2. **監控 GitHub Actions**：
   - 前往：https://github.com/CarlLee1983/tappay-backend-payment-node/actions
   - 查看 `Release Please` workflow 執行結果

3. **檢查 npm 發布結果**：
   - 如果成功，套件會出現在：https://www.npmjs.com/package/@carllee1983/tappay-backend-payment
   - 版本 `1.1.1` 應該會出現在版本列表中

4. **驗證發布內容**：
   ```bash
   npm view @carllee1983/tappay-backend-payment@1.1.1
   ```

## 🔗 相關連結

- npm 套件頁面：https://www.npmjs.com/package/@carllee1983/tappay-backend-payment
- GitHub Actions：https://github.com/CarlLee1983/tappay-backend-payment-node/actions
- npm 帳號設定：https://www.npmjs.com/settings/carllee1983

