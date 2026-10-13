import { costResponseAdapter } from './cost-response.mjs'
import { discoveryOperations } from './discovery.mjs'
import { billingOperations } from './billing.mjs'
import { createLocalProviderControl, parameters, segment, labels } from '@crowsi/provider-http-transport/local-control'
import type { CredentialSource, LocalAccount, LocalOperation } from '@crowsi/provider-http-transport/local-control'
const origin = 'https://management.azure.com'
const scope = (a: LocalAccount) => `${origin}/subscriptions/${segment(a.account)}`
export const operations: readonly LocalOperation[] = Object.freeze([
  ...discoveryOperations,
  ...billingOperations,
  { id: 'account.read', effect: 'read', requiredPermissions: ['Microsoft.Resources/subscriptions/read'],
    build(input, a) { parameters(input, []); return { method: 'GET', url: `${scope(a)}?api-version=2022-12-01` } } },
  { id: 'permissions.read', effect: 'read', requiredPermissions: ['Microsoft.Authorization/permissions/read'],
    build(input, a) { const p = parameters(input, ['group']); return { method: 'GET',
      url: `${scope(a)}/resourcegroups/${segment(p.group)}/providers/Microsoft.Authorization/permissions?api-version=2022-04-01` } } },
  { id: 'group.read', effect: 'read', requiredPermissions: ['Microsoft.Resources/subscriptions/resourceGroups/read'],
    build(input, a) { const p = parameters(input, ['group']); return { method: 'GET',
      url: `${scope(a)}/resourcegroups/${segment(p.group)}?api-version=2021-04-01` } } },
  { id: 'group.set-tags', effect: 'write', requiredPermissions: ['Microsoft.Resources/subscriptions/resourceGroups/write'],
    build(input, a) { const p = parameters(input, ['group', 'tags']); return { method: 'PATCH',
      url: `${scope(a)}/resourcegroups/${segment(p.group)}?api-version=2021-04-01`, body: JSON.stringify({ tags: labels(p.tags) }) } } },
])
export function createControl(account: LocalAccount, credentials: CredentialSource, fetchImplementation?: typeof fetch, extensions: readonly LocalOperation[] = []) {
  if (account.provider !== 'azure') throw new Error('provider/account/mismatch')
  segment(account.account)
  return createLocalProviderControl({ account, credentials, operations: [...operations, ...extensions], allowedOrigins: [origin], fetchImplementation: costResponseAdapter(account, fetchImplementation) })
}

export { cliCredentials } from './credentials.mjs'

export const serviceProfile = Object.freeze({
  provider: "azure",
  accountScope: "Subscription ID; discovery enumerates credential-visible subscriptions.",
  credentialSource: "Existing Azure CLI login bound to tenant, subject and selected subscription.",
  permissionCoverage: "Subscription/resource-group action and exclusion patterns; never expand into a new grant.",
  billingCoverage: "ActualCost query is an observation, not a final invoice.",
  permissionState: 'not-observed' as const,
  operations: Object.freeze(operations.map(({ id, effect, requiredPermissions }) =>
    Object.freeze({ id, effect, requiredPermissions: Object.freeze([...requiredPermissions]) }))),
})
