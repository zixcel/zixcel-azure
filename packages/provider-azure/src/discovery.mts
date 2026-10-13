import { parameters, segment } from '@crowsi/provider-http-transport/local-control'
import type { LocalOperation } from '@crowsi/provider-http-transport/local-control'
const origin = 'https://management.azure.com'
export const discoveryOperations: readonly LocalOperation[] = [
  { id: 'accounts.list', effect: 'read', requiredPermissions: ['Microsoft.Resources/subscriptions/read'],
    build(input) { parameters(input, []); return { method: 'GET', url: `${origin}/subscriptions?api-version=2022-12-01` } } },
  { id: 'permissions.subscription-read', effect: 'read', requiredPermissions: ['Microsoft.Authorization/permissions/read'],
    build(input, a) { parameters(input, []); return { method: 'GET',
      url: `${origin}/subscriptions/${segment(a.account)}/providers/Microsoft.Authorization/permissions?api-version=2022-04-01` } } },
  { id: 'providers.list', effect: 'read', requiredPermissions: ['Microsoft.Resources/subscriptions/providers/read'],
    build(input, a) { parameters(input, []); return { method: 'GET',
      url: `${origin}/subscriptions/${segment(a.account)}/providers?api-version=2021-04-01` } } },
]
