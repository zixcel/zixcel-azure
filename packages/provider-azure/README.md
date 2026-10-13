# @zixcel/provider-azure

Local administrator operations composed with Crowsi's one-use HTTP control.
This is the Node runtime package, separate from any existing Rust planning API.

## Install

```sh
npm install @zixcel/provider-azure@0.1.2
```

Registry publication is a separate gate; the initial candidate is not declared
published until its official archive and provenance are verified.

## Initial catalog

Azure subscription identity, resource-group permissions and tags, and a bounded 31-day ActualCost query. The CLI adapter requires an already authenticated az session and matching tenant/subject.

## Trusted owner composition

```js
import { createControl } from '@zixcel/provider-azure'
const control = createControl(account, credentialSource)
const plan = control.prepare(operationId, input)
// Present method, URL, exact body, effect and permissions to the administrator.
const grant = control.approve(plan, Date.now() + 30_000)
const receipt = await control.execute(grant.id, plan)
```

The account identifies provider, subject and account scope. The trusted owner
supplies credentials; callers never receive the bearer token. Only expose an
execute port to generated code, and run it in a separately restricted workload.
Local approval does not grant remote provider permissions. Required permissions
are operation metadata, not proof of effective access or complete IAM inventory.

Read and write use the same prepare/approve/execute protocol. There is no login,
network request, keyring lookup, cloud mutation or billing action on import.
Unknown operations and extra input fields are rejected. Pagination is not
followed automatically; review a separate request for every additional page.

The optional fourth argument is a trusted-owner extension catalog. Extensions
must declare their method, exact resource mapping, input validation, effect and
permission requirements. The same account/destination/body/grant boundary applies.
Never let an LLM supply that catalog or acquire a new grant without owner review.

## Test isolation

```sh
npm ci --ignore-scripts
npm test
```

Tests inject fake credentials and fake HTTP state. They verify read and write,
changed resource rejection and permission denial without reading the host's
credential stores or contacting provider accounts. These tests do not establish
actual-account acceptance. Production connection is a later, separate operation.

The first catalog is intentionally bounded. Binary finance reports, complete
provider IAM introspection, continuous polling and destructive operations are
not implemented by this release. Do not substitute planning for observed rights,
or estimates for final provider invoices.

Apache-2.0. See LICENSE and NOTICE. Source: zixcel/zixcel-azure.

For independent mutation read-back, prepare `group.read` for the same group; subscription identity is not group state. [Resource Groups Get](https://learn.microsoft.com/en-us/rest/api/resources/resource-groups/get?view=rest-resources-2021-04-01).

## Administrator discovery (new source catalog)

`serviceProfile` describes the actual account scope, credential source, bounded operation list, and limits of permission/billing coverage. It contains no credentials, performs no login/request and reports `not-observed`; required permissions remain declarations. Discovery is a separate one-use reviewed read, not automatic account selection or authorization. Each cursor/page requires its own plan and grant. Source additions are not contained in the previously published package version until a new release is accepted.

## Exact cost source (new source behavior)

`billing.cost-read` returns `{ kind, numberEncoding, sourceDigest, value }`. JSON numeric primitives in `value` are their original lexical strings, retaining decimal precision before a caller uses shared exact cost arithmetic. `sourceDigest` hashes the original bounded HTTP bytes. This is ActualCost query data, not a final invoice; do not cast these strings to floating point for accounting or infer that all pages/periods are complete.

Date inputs remain explicit calendar dates and become UTC day boundaries in the request. `query/read` is the read requirement; older Azure role definitions may also expose `query/action`. Neither declaration proves actual IAM access.

Primary references: [Azure Cost Management operations](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/management-and-governance#microsoftcostmanagement), [Query API](https://learn.microsoft.com/en-us/rest/api/cost-management/query/usage?view=rest-cost-management-2025-03-01). The adapter reuses Crowsi bounded HTTP; it has no credential store, implicit retry or new grant authority.
