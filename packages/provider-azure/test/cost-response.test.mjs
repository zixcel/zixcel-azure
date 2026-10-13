import assert from 'node:assert/strict'
import test from 'node:test'
import { createControl } from '../dist/index.mjs'
const account = { provider: 'azure', subject: 'synthetic-owner', account: 'synthetic-account' }
async function receipt(response) {
  const control = createControl(account, { acquire: async () => 'synthetic-never-real-credential' }, async () => response)
  const plan = control.prepare('billing.cost-read', { from: '2026-10-01', to: '2026-10-12' })
  return control.execute(control.approve(plan, Date.now() + 10000).id, plan)
}
test('cost queries preserve high precision numeric source and bind its original bytes', async () => {
  const result = await receipt(new Response('{"properties":{"rows":[[12345678901234567890.123,20261001,"USD"]]}}'))
  assert.equal(result.data.kind, 'azure-actual-cost-query')
  assert.deepEqual(result.data.value.properties.rows[0], ['12345678901234567890.123', '20261001', 'USD'])
  assert.match(result.data.sourceDigest, /^[a-f0-9]{64}$/)
})
test('malformed and oversized cost data fail without leaking upstream body content', async () => {
  await assert.rejects(receipt(new Response('synthetic-sensitive-invalid-json')), /unavailable/)
  await assert.rejects(receipt(new Response('{"value":"' + 'x'.repeat(1048576) + '"}')), /unavailable/)
})
