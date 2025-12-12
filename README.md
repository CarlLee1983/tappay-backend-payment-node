# TapPay Backend Payment SDK

[English](./README.md) | [繁體中文](./README_zh-TW.md)

> A TypeScript SDK for TapPay Backend Payment APIs

[![npm version](https://img.shields.io/npm/v/tappay-backend-payment.svg)](https://www.npmjs.com/package/tappay-backend-payment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js->=18.0.0-green.svg)](https://nodejs.org/)

## Features

- 🔒 **Full TypeScript Support** - Complete type definitions for all APIs
- 🚀 **Modern Architecture** - Built with ES Modules and CommonJS support
- ⚡ **Zero Dependencies** - Uses native `fetch` API (Node.js 18+)
- 🛡️ **Error Handling** - Typed error classes for precise error handling
- 📦 **Small Bundle Size** - Minimal footprint for production use

## Installation

```bash
npm install tappay-backend-payment
# or
yarn add tappay-backend-payment
# or
pnpm add tappay-backend-payment
# or
bun add tappay-backend-payment
```

## Quick Start

```typescript
import { TapPayClient, Env, Currency } from 'tappay-backend-payment'

// Create client
const client = new TapPayClient({
  partnerKey: 'your_partner_key',
  merchantId: 'your_merchant_id',
  env: Env.Sandbox, // Use Env.Production for production
})

// Pay by Prime
const payment = await client.payByPrime({
  prime: 'prime_from_frontend',
  amount: 100,
  currency: Currency.TWD,
  details: 'Product Description',
  cardholder: {
    phone_number: '+886912345678',
    name: 'Test User',
    email: 'test@example.com',
  },
})

console.log(`Transaction ID: ${payment.rec_trade_id}`)
```

## API Reference

### TapPayClient

The main client class for interacting with TapPay APIs.

#### Constructor

```typescript
new TapPayClient({
  partnerKey: string,   // Required: Partner Key from TapPay Portal
  merchantId: string,   // Required: Merchant ID
  env?: Env,            // Optional: Env.Sandbox (default) or Env.Production
  timeout?: number,     // Optional: Request timeout in ms (default: 30000)
})
```

### Payment Methods

#### Pay by Prime

Process a payment using a prime token from frontend SDK.

```typescript
const response = await client.payByPrime({
  prime: 'test_prime_123',
  amount: 100,
  currency: Currency.TWD,
  details: 'Test Payment',
  cardholder: {
    phone_number: '+886912345678',
    name: 'Test User',
    email: 'test@example.com',
  },
  // Optional: Enable 3D Secure
  three_domain_secure: true,
  result_url: {
    frontend_redirect_url: 'https://example.com/payment/success',
    backend_notify_url: 'https://example.com/api/notify',
  },
  // Optional: Remember card for future payments
  remember: true,
})

// If remember=true, save these for future payments
if (response.card_secret) {
  const { card_key, card_token } = response.card_secret
  // Store securely for recurring payments
}
```

#### Pay by Card Token

Process a payment using saved card credentials.

```typescript
const response = await client.payByToken({
  card_key: 'saved_card_key',
  card_token: 'saved_card_token',
  amount: 100,
  currency: Currency.TWD,
  details: 'Recurring Payment',
})
```

### Transaction Management

#### Refund

Process a full or partial refund.

```typescript
// Full refund
await client.refund('D20231201123456789')

// Partial refund
await client.refund('D20231201123456789', { amount: 50 })
```

#### Query Records

Retrieve transaction records with filtering and pagination.

```typescript
const records = await client.getRecords({
  records_per_page: 10,
  page: 0,
  filters: {
    time: {
      start_time: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
      end_time: Date.now(),
    },
  },
  order_by: {
    attribute: 'time',
    is_descending: true,
  },
})
```

#### Get Single Transaction

```typescript
const record = await client.getTransaction('D20231201123456789')
if (record) {
  console.log(`Status: ${record.status}`)
}
```

#### Get Trade History

Get detailed transaction history including all events.

```typescript
const history = await client.getTradeHistory('D20231201123456789')
history.trade_history?.forEach(event => {
  console.log(`${event.event_type}: ${event.status}`)
})
```

### Advanced APIs

#### Capture Today

Capture a delayed-capture transaction immediately.

```typescript
await client.capToday('D20231201123456789')
```

#### Cancel Capture

Cancel a pending capture before bank batch processing.

```typescript
await client.cancelCapture('D20231201123456789')
```

#### Cancel Refund

Cancel a pending refund (currently only supported by Taishin Bank).

```typescript
await client.cancelRefund('D20231201123456789', 'R20231201123456789')
```

### Card Management

#### Bind Card

Bind a card for future token-based payments without charging.

```typescript
const response = await client.bindCard({
  prime: 'prime_from_frontend',
  currency: Currency.TWD,
  cardholder: {
    phone_number: '+886912345678',
    name: 'Test User',
    email: 'test@example.com'
  }
})

if (response.card_secret) {
  const { card_key, card_token } = response.card_secret
  // Store for future payments
}
```

#### Remove Card

Remove a bound card from TapPay servers.

```typescript
await client.removeCard('card_key_123', 'card_token_123')
```

## Error Handling

The SDK provides typed error classes for precise error handling:

```typescript
import {
  TapPayClient,
  TapPayError,
  TapPayConfigError,
  TapPayTimeoutError,
  TapPayValidationError,
} from 'tappay-backend-payment'

try {
  await client.payByPrime({ ... })
} catch (error) {
  if (error instanceof TapPayError) {
    // API error (e.g., invalid prime, insufficient funds)
    console.error(`API Error: ${error.message}`)
    console.error(`Status Code: ${error.status}`)
    console.error(`Transaction ID: ${error.recTradeId}`)
  } else if (error instanceof TapPayTimeoutError) {
    // Request timeout
    console.error(`Timeout after ${error.timeout}ms`)
  } else if (error instanceof TapPayConfigError) {
    // Configuration error
    console.error(`Config Error: ${error.field}`)
  }
}
```

## Backend Notify

For 3D Secure and e-payment transactions, TapPay will POST to your `backend_notify_url`:

```typescript
import type { BackendNotifyPayload } from 'tappay-backend-payment'

// Express.js example
app.post('/api/notify', (req, res) => {
  const payload: BackendNotifyPayload = req.body

  if (payload.status === 0) {
    // Payment successful
    console.log(`Transaction ${payload.rec_trade_id} completed`)
  } else {
    // Payment failed
    console.log(`Transaction failed: ${payload.msg}`)
  }

  res.status(200).send('OK')
})
```

## Currency Support

The SDK supports multiple currencies:

```typescript
import { Currency, CurrencyMultiplier } from 'tappay-backend-payment'

Currency.TWD // Taiwan Dollar (multiplier: 1)
Currency.USD // US Dollar (multiplier: 100)
Currency.JPY // Japanese Yen (multiplier: 1)
Currency.EUR // Euro (multiplier: 100)
// ... and more
```

> **Note**: For currencies with multiplier of 100, the amount should be multiplied by 100.
> For example, USD $1.00 should be sent as `amount: 100`.

## Test Cards

For sandbox testing, use TapPay's test cards:
- **Success**: `4242424242424242`
- **Failed**: `4111111111111111`

See [TapPay Documentation](https://docs.tappaysdk.com/tutorial/zh/reference.html#test-card) for more test cards.

## Requirements

- Node.js >= 18.0.0 (for native fetch support)
- TypeScript >= 5.0 (for development)

## License

MIT © Carl Lee

## Related

- [TapPay Documentation](https://docs.tappaysdk.com/)
- [TapPay Portal](https://www.tappaysdk.com/)
