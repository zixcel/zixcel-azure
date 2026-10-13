import { createHash } from 'node:crypto'
import { createProviderHttpTransport } from '@crowsi/provider-http-transport'
import { segment } from '@crowsi/provider-http-transport/local-control'
import type { LocalAccount } from '@crowsi/provider-http-transport/local-control'
import type { ProviderHttpRequest } from '@crowsi/provider-http-transport'
const origin = 'https://management.azure.com'

/** Bound the actual HTTP bytes, then retain numeric lexemes without float rounding. */
export function costResponseAdapter(account: LocalAccount, implementation: typeof fetch = globalThis.fetch): typeof fetch {
  const endpoint = `${origin}/subscriptions/${segment(account.account)}/providers/Microsoft.CostManagement/query`
  const transport = createProviderHttpTransport({ allowedOrigins: [origin], fetchImplementation: implementation,
    maximumRequestBytes: 65536, maximumResponseBytes: 1048576, timeoutMs: 15000 })
  return async (input, init) => {
    if (typeof input !== 'string' || input.split('?')[0] !== endpoint || init?.method !== 'POST') {
      return implementation(input, init)
    }
    const result = await transport.request({ url: input, method: init.method as ProviderHttpRequest['method'],
      headers: init.headers, body: typeof init.body === 'string' ? init.body : undefined,
      signal: init.signal ?? undefined })
    if (result.status !== 200) return new Response('{}', { status: result.status })
    let value: unknown
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(result.body)
      value = JSON.parse(text, (_key, item, context?: { source?: string }) => {
        if (typeof item !== 'number') return item
        if (!context?.source) throw new Error('missing numeric source')
        return context.source
      })
    } catch { throw new Error('provider/cost/response-invalid') }
    const data = { kind: 'azure-actual-cost-query', numberEncoding: 'json-lexeme-strings',
      sourceDigest: createHash('sha256').update(result.body).digest('hex'), value }
    const body = JSON.stringify(data)
    if (Buffer.byteLength(body) > 1048576) throw new Error('provider/cost/response-limit')
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
}
