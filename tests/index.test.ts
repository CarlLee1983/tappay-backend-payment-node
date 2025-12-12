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

describe('TapPay Backend Payment SDK', () => {
  describe('VERSION', () => {
    it('should export the current version from package.json', () => {
      expect(VERSION).toBe(packageJson.version)
    })

    it('should be a valid semver string', () => {
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+/)
    })
  })

  describe('Env', () => {
    it('should have Sandbox environment', () => {
      expect(Env.Sandbox).toBe('https://sandbox.tappaysdk.com')
    })

    it('should have Production environment', () => {
      expect(Env.Production).toBe('https://prod.tappaysdk.com')
    })

    it('should only have two environments', () => {
      const envValues = Object.values(Env)
      expect(envValues).toHaveLength(2)
      expect(envValues).toContain(Env.Sandbox)
      expect(envValues).toContain(Env.Production)
    })
  })

  describe('Currency', () => {
    it('should have TWD currency', () => {
      expect(Currency.TWD).toBe('TWD')
    })

    it('should have USD currency', () => {
      expect(Currency.USD).toBe('USD')
    })

    it('should have JPY currency', () => {
      expect(Currency.JPY).toBe('JPY')
    })

    it('should have HKD currency', () => {
      expect(Currency.HKD).toBe('HKD')
    })

    it('should have MYR currency', () => {
      expect(Currency.MYR).toBe('MYR')
    })

    it('should have SGD currency', () => {
      expect(Currency.SGD).toBe('SGD')
    })

    it('should have IDR currency', () => {
      expect(Currency.IDR).toBe('IDR')
    })

    it('should have THB currency', () => {
      expect(Currency.THB).toBe('THB')
    })

    it('should have PHP currency', () => {
      expect(Currency.PHP).toBe('PHP')
    })

    it('should have VND currency', () => {
      expect(Currency.VND).toBe('VND')
    })

    it('should have AUD currency', () => {
      expect(Currency.AUD).toBe('AUD')
    })

    it('should have EUR currency', () => {
      expect(Currency.EUR).toBe('EUR')
    })

    it('should have GBP currency', () => {
      expect(Currency.GBP).toBe('GBP')
    })

    describe('CurrencyMultiplier', () => {
      it('should have correct multiplier for TWD (no decimal)', () => {
        expect(CurrencyMultiplier[Currency.TWD]).toBe(1)
      })

      it('should have correct multiplier for USD (2 decimals)', () => {
        expect(CurrencyMultiplier[Currency.USD]).toBe(100)
      })

      it('should have correct multiplier for JPY (no decimal)', () => {
        expect(CurrencyMultiplier[Currency.JPY]).toBe(1)
      })

      it('should have correct multiplier for HKD (2 decimals)', () => {
        expect(CurrencyMultiplier[Currency.HKD]).toBe(100)
      })

      it('should have correct multiplier for IDR (no decimal)', () => {
        expect(CurrencyMultiplier[Currency.IDR]).toBe(1)
      })

      it('should have correct multiplier for VND (no decimal)', () => {
        expect(CurrencyMultiplier[Currency.VND]).toBe(1)
      })

      it('should have correct multiplier for THB (2 decimals)', () => {
        expect(CurrencyMultiplier[Currency.THB]).toBe(100)
      })

      it('should have multipliers for all currencies', () => {
        const currencies = Object.values(Currency)
        for (const currency of currencies) {
          expect(CurrencyMultiplier[currency]).toBeDefined()
          expect(CurrencyMultiplier[currency]).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('CardType', () => {
    it('should have Credit type', () => {
      expect(CardType.Credit).toBe(1)
    })

    it('should have Debit type', () => {
      expect(CardType.Debit).toBe(2)
    })

    it('should have Prepaid type', () => {
      expect(CardType.Prepaid).toBe(3)
    })

    describe('getCardTypeName', () => {
      it('should get card type name for Credit', () => {
        expect(getCardTypeName(CardType.Credit)).toBe('Credit')
      })

      it('should get card type name for Debit', () => {
        expect(getCardTypeName(CardType.Debit)).toBe('Debit')
      })

      it('should get card type name for Prepaid', () => {
        expect(getCardTypeName(CardType.Prepaid)).toBe('Prepaid')
      })

      it('should return Unknown for invalid card type', () => {
        expect(getCardTypeName(999 as CardType)).toBe('Unknown')
      })

      it('should return Unknown for negative card type', () => {
        expect(getCardTypeName(-1 as CardType)).toBe('Unknown')
      })
    })
  })

  describe('TapPayClient', () => {
    describe('constructor', () => {
      it('should create client with valid config', () => {
        const client = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
        })

        expect(client).toBeInstanceOf(TapPayClient)
        expect(client.isSandbox).toBe(true)
        expect(client.merchantId).toBe('test_merchant_id')
      })

      it('should use sandbox environment by default', () => {
        const client = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
        })

        expect(client.environment).toBe(Env.Sandbox)
        expect(client.isSandbox).toBe(true)
      })

      it('should use production environment when specified', () => {
        const client = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
          env: Env.Production,
        })

        expect(client.environment).toBe(Env.Production)
        expect(client.isSandbox).toBe(false)
      })

      it('should use custom timeout when specified', () => {
        const client = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
          timeout: 60000,
        })

        expect(client).toBeInstanceOf(TapPayClient)
      })

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

      it('should throw TapPayConfigError for missing merchantId', () => {
        expect(() => {
          new TapPayClient({
            partnerKey: 'test_partner_key',
            merchantId: '',
          })
        }).toThrow(TapPayConfigError)
      })

      it('should throw TapPayConfigError for whitespace-only merchantId', () => {
        expect(() => {
          new TapPayClient({
            partnerKey: 'test_partner_key',
            merchantId: '   ',
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

      it('should throw TapPayConfigError for invalid timeout (negative)', () => {
        expect(() => {
          new TapPayClient({
            partnerKey: 'test_partner_key',
            merchantId: 'test_merchant_id',
            timeout: -1,
          })
        }).toThrow(TapPayConfigError)
      })

      it('should allow omitted timeout (uses default)', () => {
        const client = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
        })
        expect(client).toBeInstanceOf(TapPayClient)
      })
    })

    describe('methods existence', () => {
      const client = new TapPayClient({
        partnerKey: 'test_partner_key',
        merchantId: 'test_merchant_id',
      })

      it('should have payByPrime method', () => {
        expect(typeof client.payByPrime).toBe('function')
      })

      it('should have payByToken method', () => {
        expect(typeof client.payByToken).toBe('function')
      })

      it('should have refund method', () => {
        expect(typeof client.refund).toBe('function')
      })

      it('should have cancelRefund method', () => {
        expect(typeof client.cancelRefund).toBe('function')
      })

      it('should have capToday method', () => {
        expect(typeof client.capToday).toBe('function')
      })

      it('should have cancelCapture method', () => {
        expect(typeof client.cancelCapture).toBe('function')
      })

      it('should have bindCard method', () => {
        expect(typeof client.bindCard).toBe('function')
      })

      it('should have removeCard method', () => {
        expect(typeof client.removeCard).toBe('function')
      })

      it('should have getRecords method', () => {
        expect(typeof client.getRecords).toBe('function')
      })

      it('should have getTransaction method', () => {
        expect(typeof client.getTransaction).toBe('function')
      })

      it('should have getTradeHistory method', () => {
        expect(typeof client.getTradeHistory).toBe('function')
      })
    })

    describe('getters', () => {
      it('should return correct environment', () => {
        const sandboxClient = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
          env: Env.Sandbox,
        })
        expect(sandboxClient.environment).toBe(Env.Sandbox)

        const prodClient = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
          env: Env.Production,
        })
        expect(prodClient.environment).toBe(Env.Production)
      })

      it('should return correct isSandbox value', () => {
        const sandboxClient = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
          env: Env.Sandbox,
        })
        expect(sandboxClient.isSandbox).toBe(true)

        const prodClient = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'test_merchant_id',
          env: Env.Production,
        })
        expect(prodClient.isSandbox).toBe(false)
      })

      it('should return correct merchantId', () => {
        const client = new TapPayClient({
          partnerKey: 'test_partner_key',
          merchantId: 'my_merchant_123',
        })
        expect(client.merchantId).toBe('my_merchant_123')
      })
    })

    describe('API calls with mocked fetch', () => {
      const originalFetch = globalThis.fetch
      let mockFetch: ReturnType<typeof mock>

      // Helper function to create mock response
      const createMockResponse = (data: unknown) => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify(data)),
        json: () => Promise.resolve(data),
      })

      beforeEach(() => {
        mockFetch = mock(() => Promise.resolve(createMockResponse({ status: 0, msg: 'Success' })))
        globalThis.fetch = mockFetch as unknown as typeof fetch
      })

      afterEach(() => {
        globalThis.fetch = originalFetch
      })

      const client = new TapPayClient({
        partnerKey: 'test_partner_key',
        merchantId: 'test_merchant_id',
      })

      describe('payByPrime', () => {
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

        it('should return successful response', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(
              createMockResponse({
                status: 0,
                msg: 'Success',
                rec_trade_id: 'D20231201123456789',
                amount: 100,
              })
            )
          )

          const response = await client.payByPrime({
            prime: 'test_prime',
            amount: 100,
            details: 'Test Payment',
          })

          expect(response.status).toBe(0)
          expect(response.rec_trade_id).toBe('D20231201123456789')
        })

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
      })

      describe('payByToken', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          await client.payByToken({
            card_key: 'test_card_key',
            card_token: 'test_card_token',
            amount: 100,
            currency: Currency.TWD,
            details: 'Test Payment',
          })

          const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/payment/pay-by-token')
        })
      })

      describe('refund', () => {
        it('should call correct endpoint for full refund', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          await client.refund('D20231201123456789')

          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/transaction/refund')
          const body = JSON.parse(options.body as string)
          expect(body.rec_trade_id).toBe('D20231201123456789')
        })

        it('should include amount for partial refund', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          await client.refund('D20231201123456789', { amount: 50 })

          const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          const body = JSON.parse(options.body as string)
          expect(body.amount).toBe(50)
        })
      })

      describe('cancelRefund', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          await client.cancelRefund('D20231201123456789', 'R20231201123456789')

          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/transaction/refund/cancel')
          const body = JSON.parse(options.body as string)
          expect(body.rec_trade_id).toBe('D20231201123456789')
          expect(body.refund_id).toBe('R20231201123456789')
        })
      })

      describe('capToday', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          await client.capToday('D20231201123456789')

          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/transaction/cap')
          const body = JSON.parse(options.body as string)
          expect(body.rec_trade_id).toBe('D20231201123456789')
        })
      })

      describe('cancelCapture', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          await client.cancelCapture('D20231201123456789')

          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/transaction/cap/cancel')
          const body = JSON.parse(options.body as string)
          expect(body.rec_trade_id).toBe('D20231201123456789')
        })
      })

      describe('bindCard', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(
              createMockResponse({
                status: 0,
                msg: 'Success',
                card_secret: {
                  card_key: 'key123',
                  card_token: 'token123',
                },
              })
            )
          )

          await client.bindCard({
            prime: 'test_prime',
            currency: Currency.TWD,
            cardholder: {
              phone_number: '+886912345678',
              name: 'Test User',
              email: 'test@example.com',
            },
          })

          const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/card/bind')
        })
      })

      describe('removeCard', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          await client.removeCard('card_key_123', 'card_token_123')

          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/card/remove')
          const body = JSON.parse(options.body as string)
          expect(body.card_key).toBe('card_key_123')
          expect(body.card_token).toBe('card_token_123')
        })
      })

      describe('getRecords', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success', trade_records: [] }))
          )

          await client.getRecords()

          const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/transaction/query')
        })

        it('should include filters in request', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success', trade_records: [] }))
          )

          await client.getRecords({
            records_per_page: 10,
            page: 0,
            filters: {
              rec_trade_id: 'D20231201123456789',
            },
          })

          const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          const body = JSON.parse(options.body as string)
          expect(body.records_per_page).toBe(10)
          expect(body.page).toBe(0)
          expect(body.filters.rec_trade_id).toBe('D20231201123456789')
        })
      })

      describe('getTransaction', () => {
        it('should return first record when found', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(
              createMockResponse({
                status: 0,
                msg: 'Success',
                trade_records: [
                  {
                    rec_trade_id: 'D20231201123456789',
                    amount: 100,
                  },
                ],
              })
            )
          )

          const result = await client.getTransaction('D20231201123456789')

          expect(result).not.toBeNull()
          expect(result?.rec_trade_id).toBe('D20231201123456789')
        })

        it('should return null when not found', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success', trade_records: [] }))
          )

          const result = await client.getTransaction('D20231201123456789')

          expect(result).toBeNull()
        })

        it('should return null when trade_records is undefined', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success' }))
          )

          const result = await client.getTransaction('D20231201123456789')

          expect(result).toBeNull()
        })
      })

      describe('getTradeHistory', () => {
        it('should call correct endpoint', async () => {
          mockFetch.mockImplementation(() =>
            Promise.resolve(createMockResponse({ status: 0, msg: 'Success', trade_history: [] }))
          )

          await client.getTradeHistory('D20231201123456789')

          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
          expect(url).toBe('https://sandbox.tappaysdk.com/tpc/transaction/trade-history')
          const body = JSON.parse(options.body as string)
          expect(body.rec_trade_id).toBe('D20231201123456789')
        })
      })
    })

    describe('error handling', () => {
      const originalFetch = globalThis.fetch

      afterEach(() => {
        globalThis.fetch = originalFetch
      })

      const client = new TapPayClient({
        partnerKey: 'test_partner_key',
        merchantId: 'test_merchant_id',
        timeout: 100,
      })

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

      it('should throw TapPayError on network error', async () => {
        globalThis.fetch = (() =>
          Promise.reject(new Error('Network error'))) as unknown as typeof fetch

        await expect(
          client.payByPrime({
            prime: 'test_prime',
            amount: 100,
            details: 'Test Payment',
          })
        ).rejects.toThrow(TapPayError)
      })

      it('should throw TapPayError on non-Error rejection', async () => {
        globalThis.fetch = (() => Promise.reject('Unknown error')) as unknown as typeof fetch

        await expect(
          client.payByPrime({
            prime: 'test_prime',
            amount: 100,
            details: 'Test Payment',
          })
        ).rejects.toThrow(TapPayError)
      })

      it('should throw TapPayError with rec_trade_id on API error', async () => {
        globalThis.fetch = (() =>
          Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () =>
              Promise.resolve(
                JSON.stringify({
                  status: 10001,
                  msg: 'Invalid prime',
                  rec_trade_id: 'D20231201123456789',
                })
              ),
            json: () =>
              Promise.resolve({
                status: 10001,
                msg: 'Invalid prime',
                rec_trade_id: 'D20231201123456789',
              }),
          })) as unknown as typeof fetch

        try {
          await client.payByPrime({
            prime: 'invalid_prime',
            amount: 100,
            details: 'Test Payment',
          })
        } catch (error) {
          expect(error).toBeInstanceOf(TapPayError)
          expect((error as TapPayError).recTradeId).toBe('D20231201123456789')
        }
      })

      it('should handle JSON parse errors gracefully', async () => {
        globalThis.fetch = (() =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve('Invalid JSON response'),
          })) as unknown as typeof fetch

        await expect(
          client.payByPrime({
            prime: 'test_prime',
            amount: 100,
            details: 'Test Payment',
          })
        ).rejects.toThrow(TapPayError)
      })

      it('should handle empty response', async () => {
        globalThis.fetch = (() =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve(''),
          })) as unknown as typeof fetch

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
    })

    describe('input validation', () => {
      const client = new TapPayClient({
        partnerKey: 'test_partner_key',
        merchantId: 'test_merchant_id',
      })

      describe('payByPrime validation', () => {
        it('should throw TapPayValidationError for empty prime', async () => {
          await expect(
            client.payByPrime({
              prime: '',
              amount: 100,
              details: 'Test Payment',
            })
          ).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for whitespace-only prime', async () => {
          await expect(
            client.payByPrime({
              prime: '   ',
              amount: 100,
              details: 'Test Payment',
            })
          ).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for zero amount', async () => {
          await expect(
            client.payByPrime({
              prime: 'test_prime',
              amount: 0,
              details: 'Test Payment',
            })
          ).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for negative amount', async () => {
          await expect(
            client.payByPrime({
              prime: 'test_prime',
              amount: -100,
              details: 'Test Payment',
            })
          ).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for empty order_number', async () => {
          await expect(
            client.payByPrime({
              prime: 'test_prime',
              amount: 100,
              order_number: '',
              details: 'Test Payment',
            })
          ).rejects.toThrow(TapPayValidationError)
        })
      })

      describe('payByToken validation', () => {
        it('should throw TapPayValidationError for empty card_key', async () => {
          await expect(
            client.payByToken({
              card_key: '',
              card_token: 'test_token',
              amount: 100,
              currency: Currency.TWD,
            })
          ).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for empty card_token', async () => {
          await expect(
            client.payByToken({
              card_key: 'test_key',
              card_token: '',
              amount: 100,
              currency: Currency.TWD,
            })
          ).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for missing currency', async () => {
          await expect(
            client.payByToken({
              card_key: 'test_key',
              card_token: 'test_token',
              amount: 100,
              // @ts-expect-error - Testing missing currency
              currency: undefined,
            })
          ).rejects.toThrow(TapPayValidationError)
        })
      })

      describe('refund validation', () => {
        it('should throw TapPayValidationError for empty recTradeId', async () => {
          await expect(client.refund('')).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for negative refund amount', async () => {
          await expect(client.refund('D20231201123456789', { amount: -50 })).rejects.toThrow(
            TapPayValidationError
          )
        })

        it('should throw TapPayValidationError for zero refund amount', async () => {
          await expect(client.refund('D20231201123456789', { amount: 0 })).rejects.toThrow(
            TapPayValidationError
          )
        })
      })

      describe('cancelRefund validation', () => {
        it('should throw TapPayValidationError for empty recTradeId', async () => {
          await expect(client.cancelRefund('', 'R20231201123456789')).rejects.toThrow(
            TapPayValidationError
          )
        })

        it('should throw TapPayValidationError for empty refundId', async () => {
          await expect(client.cancelRefund('D20231201123456789', '')).rejects.toThrow(
            TapPayValidationError
          )
        })
      })

      describe('capToday validation', () => {
        it('should throw TapPayValidationError for empty recTradeId', async () => {
          await expect(client.capToday('')).rejects.toThrow(TapPayValidationError)
        })
      })

      describe('cancelCapture validation', () => {
        it('should throw TapPayValidationError for empty recTradeId', async () => {
          await expect(client.cancelCapture('')).rejects.toThrow(TapPayValidationError)
        })
      })

      describe('bindCard validation', () => {
        it('should throw TapPayValidationError for empty prime', async () => {
          await expect(
            client.bindCard({
              prime: '',
              currency: Currency.TWD,
            })
          ).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for missing currency', async () => {
          await expect(
            client.bindCard({
              prime: 'test_prime',
              // @ts-expect-error - Testing missing currency
              currency: undefined,
            })
          ).rejects.toThrow(TapPayValidationError)
        })
      })

      describe('removeCard validation', () => {
        it('should throw TapPayValidationError for empty cardKey', async () => {
          await expect(client.removeCard('', 'test_token')).rejects.toThrow(TapPayValidationError)
        })

        it('should throw TapPayValidationError for empty cardToken', async () => {
          await expect(client.removeCard('test_key', '')).rejects.toThrow(TapPayValidationError)
        })
      })

      describe('getTradeHistory validation', () => {
        it('should throw TapPayValidationError for empty recTradeId', async () => {
          await expect(client.getTradeHistory('')).rejects.toThrow(TapPayValidationError)
        })
      })

      describe('getTransaction validation', () => {
        it('should throw TapPayValidationError for empty recTradeId', async () => {
          await expect(client.getTransaction('')).rejects.toThrow(TapPayValidationError)
        })
      })
    })
  })

  describe('TapPayError', () => {
    it('should create error with status and message', () => {
      const error = new TapPayError('Payment failed', 10001)

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('TapPayError')
      expect(error.message).toBe('Payment failed')
      expect(error.status).toBe(10001)
      expect(error.isTransactionFailed).toBe(true)
    })

    it('should create error with optional recTradeId', () => {
      const error = new TapPayError('Payment failed', 10001, 'D20231201123456789')

      expect(error.recTradeId).toBe('D20231201123456789')
    })

    it('should create error with optional response', () => {
      const response = { status: 10001, msg: 'Error', extra: 'data' }
      const error = new TapPayError('Payment failed', 10001, undefined, response)

      expect(error.response).toEqual(response)
    })

    it('should create error from response', () => {
      const error = TapPayError.fromResponse({
        status: 10002,
        msg: 'Invalid prime',
        rec_trade_id: 'D20231201123456789',
      })

      expect(error.status).toBe(10002)
      expect(error.message).toBe('Invalid prime')
      expect(error.recTradeId).toBe('D20231201123456789')
      expect(error.response).toBeDefined()
    })

    it('should create error from response without rec_trade_id', () => {
      const error = TapPayError.fromResponse({
        status: 10003,
        msg: 'Some error',
      })

      expect(error.status).toBe(10003)
      expect(error.message).toBe('Some error')
      expect(error.recTradeId).toBeUndefined()
    })

    it('should identify success status (status = 0)', () => {
      const error = new TapPayError('Success', 0)
      expect(error.isTransactionFailed).toBe(false)
    })

    it('should identify failure status (status != 0)', () => {
      const error1 = new TapPayError('Error', 1)
      expect(error1.isTransactionFailed).toBe(true)

      const error2 = new TapPayError('Error', -1)
      expect(error2.isTransactionFailed).toBe(true)

      const error3 = new TapPayError('Error', 99999)
      expect(error3.isTransactionFailed).toBe(true)
    })

    it('should have proper stack trace', () => {
      const error = new TapPayError('Test error', 10001)
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('TapPayError')
    })
  })

  describe('TapPayConfigError', () => {
    it('should create config error with field', () => {
      const error = new TapPayConfigError('Invalid config', 'partnerKey')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('TapPayConfigError')
      expect(error.message).toBe('Invalid config')
      expect(error.field).toBe('partnerKey')
    })

    it('should create config error without field', () => {
      const error = new TapPayConfigError('Invalid config')

      expect(error.field).toBeUndefined()
    })

    it('should have proper stack trace', () => {
      const error = new TapPayConfigError('Test error', 'test')
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('TapPayConfigError')
    })
  })

  describe('TapPayTimeoutError', () => {
    it('should create timeout error with all properties', () => {
      const error = new TapPayTimeoutError('Request timeout', 30000, '/tpc/payment/pay-by-prime')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('TapPayTimeoutError')
      expect(error.message).toBe('Request timeout')
      expect(error.timeout).toBe(30000)
      expect(error.endpoint).toBe('/tpc/payment/pay-by-prime')
    })

    it('should create timeout error without endpoint', () => {
      const error = new TapPayTimeoutError('Request timeout', 30000)

      expect(error.timeout).toBe(30000)
      expect(error.endpoint).toBeUndefined()
    })

    it('should have proper stack trace', () => {
      const error = new TapPayTimeoutError('Test error', 30000)
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('TapPayTimeoutError')
    })
  })

  describe('TapPayValidationError', () => {
    it('should create validation error with field', () => {
      const error = new TapPayValidationError('Amount is required', 'amount')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('TapPayValidationError')
      expect(error.message).toBe('Amount is required')
      expect(error.field).toBe('amount')
    })

    it('should create validation error without field', () => {
      const error = new TapPayValidationError('Validation failed')

      expect(error.field).toBeUndefined()
    })

    it('should have proper stack trace', () => {
      const error = new TapPayValidationError('Test error')
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('TapPayValidationError')
    })
  })
})
