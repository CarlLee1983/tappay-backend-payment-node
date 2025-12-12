以下是本頁 TapPay 後端串接重點整理成精簡 markdown，可直接拿來對照實作使用。[1]

***

## 支付方式說明

- Direct Pay：前端輸入卡號，透過 TapPay 閘道付款。[1]
- 電子支付：以電子錢包帳戶完成（如 LINE Pay、街口、悠遊付等）。詳細支援請參考「電子支付支援功能」。[1]
- Token Pay：以行動支付（Apple Pay / Google Pay / Samsung Pay）產生的 tokenized 卡號 (DPAN) 付款。[1]

***

## Pay by Prime API

### Endpoint 與 Header

```http
// Sandbox
POST https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime
// Production
POST https://prod.tappaysdk.com/tpc/payment/pay-by-prime

Header:
Content-Type: application/json
x-api-key: {YourPartnerKey}
```


### Request 重要欄位

- prime (String, 必填)：前端 SDK getPrime 取得，效期 90 秒（部分延後授權例外）。[1]
- partner_key (String, 必填)：Portal 綁定的 Partner Key。[1]
- merchant_id (String, 必填)：商店 merchant id。[1]
- amount (int, 必填)：交易金額，非 TWD 需乘以 100 後帶入。[1]
- currency (String)：ISO 4217 代碼，如 TWD。[1]
- order_number (String)：自訂訂單編號，可重複但不可為空字串。[1]
- bank_transaction_id (String)：銀行端訂單編號，建議自訂且不可重複，用於逾時反查。[1]
- details (String)：商品/交易描述，部分收單必填，用於符合 PCI 及送至收單行。[1]
- cardholder (Object, 建議)：持卡人資訊，用於詐欺檢測與 3D 風險驗證（name / email / phone 等）。[1]
- three_domain_secure (Boolean)：是否啟用 3D 驗證，預設 false（Direct Pay 使用）。[1]
- result_url (Object)：3D / 電子支付必填  
  - frontend_redirect_url：前端導回 URL（HTTPS）。[1]
  - backend_notify_url：後端通知 URL（HTTPS, port 443）。[1]
  - go_back_url：3D 錯誤頁面「Go back」按鈕導回 URL。[1]
- remember (Boolean)：是否儲存卡片，true 時回傳 card_key / card_token 供 Pay by Card Token 使用。[1]
- instalment (int)：分期期數（Direct Pay 部分收單支援）。[1]
- delay_capture_in_days (int)：授權後幾天請款，0 為當天，-1 表示暫不請款。[1]

### 範例 Request（簡化）

```json
{
  "prime": "String",
  "partner_key": "String",
  "merchant_id": "merchantA",
  "details": "TapPay Test",
  "amount": 100,
  "cardholder": {
    "phone_number": "+886923456789",
    "name": "王小明",
    "email": "LittleMing@Wang.com",
    "zip_code": "100",
    "address": "台北市天龍區芝麻街1號1樓",
    "national_id": "A123456789"
  },
  "remember": true
}
```


### Response 重要欄位

- status (int)：交易代碼，0 為成功。[1]
- msg (String)：訊息/錯誤說明。[1]
- rec_trade_id (String)：TapPay 交易識別碼，退款 / 查詢需用，務必保存。[1]
- bank_transaction_id (String)：銀行端訂單編號。[1]
- bank_order_number (String)：收單行授權回傳訂單編號。[1]
- auth_code (String)：銀行授權碼（Direct Pay / Token Pay）。[1]
- card_secret (Object)：remember=true 時回傳  
  - card_token (String)：後續 Pay by Card Token 必填。[1]
  - card_key (String)：後續 Pay by Card Token 必填。[1]
- amount, currency：交易金額與幣別。[1]
- card_info (Object)：卡號前六後四、發卡行、卡種等資訊。[1]

***

## Pay by Card Token API

### Endpoint 與 Header

```http
// Sandbox
POST https://sandbox.tappaysdk.com/tpc/payment/pay-by-token
// Production
POST https://prod.tappaysdk.com/tpc/payment/pay-by-token

Header:
Content-Type: application/json
x-api-key: {YourPartnerKey}
```


### Request 重要欄位

- card_key (String, 必填)：由 Pay by Prime + remember=true 取得。[1]
- card_token (String, 必填)：由 Pay by Prime 取得。[1]
- partner_key (String, 必填)：Portal 綁定的 Partner Key。[1]
- merchant_id (String, 必填)：商店 merchant id。[1]
- amount (int, 必填)：交易金額，同 Prime 規則。[1]
- currency (String, 必填)：幣別，ISO 代碼。[1]
- order_number / bank_transaction_id / details：同 Pay by Prime。[1]
- three_domain_secure / result_url：若要 3D 驗證時同 Prime 規則。[1]

### 簡化範例 Request

```json
{
  "card_key": "String",
  "card_token": "String",
  "partner_key": "String",
  "currency": "TWD",
  "merchant_id": "merchantA",
  "details": "TapPay Test",
  "amount": 100
}
```


### Response 重要欄位

- status, msg：同 Pay by Prime。[1]
- rec_trade_id, bank_transaction_id, bank_order_number：同上，用於查詢及退款。[1]
- amount, currency, auth_code, card_info：同 Pay by Prime。[1]

***

## Frontend Redirect（前端導回）

- 對象：電子支付及 Direct Pay 3D 交易完成後導回 frontend_redirect_url。[1]
- Method：瀏覽器導轉，QueryString 帶回交易結果參數。[1]

### Query 參數

- rec_trade_id：TapPay 交易識別碼。[1]
- order_number：商戶訂單編號（有帶入時不可為空）。[1]
- bank_transaction_id：銀行端訂單編號。[1]
- status：交易代碼，0 為成功。[1]

> 前端參數可能被竄改，正式狀態請搭配 Backend Notify 或 Record API 再確認。[1]

***

## Backend Notify（後端通知）

- 觸發時機：電子支付及 Direct Pay 3D 完成後，自動 POST 至 backend_notify_url。[1]
- 若未收到 HTTP 200，會依序在 1/2/4/8/16 分鐘重送，最多 5 次，仍失敗會寄通知信。[1]

### Request

```http
Type: POST
URL (Sandbox/Production): https://{backend_notify_url}
Content-Type: application/json
```


### Body 重要欄位

- rec_trade_id：TapPay 交易識別碼。[1]
- bank_transaction_id, bank_order_number：銀行／收單訂單編號。[1]
- order_number：商戶訂單編號。[1]
- amount：金額。[1]
- status：0 成功，其餘為失敗代碼。[1]
- msg：交易訊息。[1]
- transaction_time_millis：交易時間；transaction_complete_millis：完成時間（部分收單）。[1]
- pay_info：電子支付支付細節（使用方式、卡號遮罩、點數等）。[1]

***

## Refund API（退款）

### Endpoint 與 Header

```http
// Sandbox
POST https://sandbox.tappaysdk.com/tpc/transaction/refund
// Production
POST https://prod.tappaysdk.com/tpc/transaction/refund

Header:
Content-Type: application/json
x-api-key: {YourPartnerKey}
```


### Request 重要欄位

- partner_key (String, 必填)：Portal Partner Key。[1]
- rec_trade_id (String, 必填)：欲退款的交易識別碼（交易成功時回傳）。[1]
- amount (int)：退款金額；不帶表示全額退款，部分退款需帶入，部分交易型態不支援部分退款。[1]
- bank_refund_id (String)：商戶端退款識別碼，不可重複，部分收單可帶入至銀行端。[1]

### 簡化範例 Request

```json
{
  "partner_key": "String",
  "rec_trade_id": "String",
  "amount": 100
}
```


### Response 重要欄位

- status, msg：退款結果代碼與訊息。[1]
- refund_id：TapPay 退款識別碼。[1]
- bank_refund_order_number：收單端退款編號。[1]
- refund_amount, currency：退款金額與幣別。[1]
- is_captured：是否已請款。[1]

***

## Record API（交易查詢）

### Endpoint 與 Header

```http
// Sandbox
POST https://sandbox.tappaysdk.com/tpc/transaction/query
// Production
POST https://prod.tappaysdk.com/tpc/transaction/query

Header:
Content-Type: application/json
x-api-key: {YourPartnerKey}
```


### Request 重要欄位

- partner_key (String, 必填)：Portal Partner Key。[1]
- records_per_page (int)：每頁筆數，預設 50，最大 200。[1]
- page (int)：頁碼，從 0 起算。[1]
- filters (Object)：查詢條件  
  - time：start_time / end_time，區間上限 90 天。[1]
  - amount：upper_limit / lower_limit。[1]
  - cardholder / merchant_id / rec_trade_id / order_number / bank_transaction_id / currency 等欄位。[1]
- order_by (Object)：排序  
  - attribute："time" 或 "amount"。[1]
  - is_descending：是否倒序。[1]

### Response 重要欄位

- status：2 表示在目前過濾條件下已無更多紀錄。[1]
- records_per_page, page, total_page_count, number_of_transactions：分頁資訊。[1]
- trade_records：交易紀錄列表（每筆內含 status, rec_trade_id, amount 等細節）。[1]

***

若你需要我再幫你拆成實作 checklist（例如：後端 controller / service 要做什麼）或對應 pseudo code，可以再說。

[1](https://docs.tappaysdk.com/tutorial/zh/back.html#overview)