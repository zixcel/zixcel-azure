import { parameters, segment } from '@crowsi/provider-http-transport/local-control'
import type { LocalOperation } from '@crowsi/provider-http-transport/local-control'
export const billingOperations: readonly LocalOperation[] = [{
  id: 'billing.cost-read', effect: 'read', requiredPermissions: ['Microsoft.CostManagement/query/action'],
  build(input, account) {
    const p = parameters(input, ['from', 'to'])
    for (const date of [p.from, p.to]) {
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
        || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('provider/input/date')
    }
    const days = (Date.parse(p.to as string) - Date.parse(p.from as string)) / 86400000
    if (days < 0 || days > 31) throw new Error('provider/input/date-range')
    return { method: 'POST',
      url: `https://management.azure.com/subscriptions/${segment(account.account)}/providers/Microsoft.CostManagement/query?api-version=2025-03-01`,
      body: JSON.stringify({ type: 'ActualCost', timeframe: 'Custom',
        timePeriod: { from: p.from, to: p.to }, dataset: { granularity: 'Daily',
          aggregation: { totalCost: { name: 'PreTaxCost', function: 'Sum' } } } }) }
  },
}]
