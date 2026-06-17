# Complete Route Coverage

`@pubflow/core` exposes Flowless, Bridge Payments, and Ultra Forms as separate backends. Mount each backend URL from the user application and override prefixes only when the backend is mounted somewhere custom.

```ts
import { createPubflow } from '@pubflow/core';

const api = createPubflow({
  apiUrl: 'https://flowless.example.com',
  paymentsUrl: 'https://payments.example.com',
  formsUrl: 'https://forms.example.com',
  modulePrefixes: {
    payments: '/bridge-payment',
    forms: '/api/v1',
  },
});
```

## Bridge Payments

| Route family | Client methods |
| --- | --- |
| Payment intents | `api.pay.createPaymentIntent`, `getPaymentIntent`, `updatePaymentIntent`, `confirmPaymentIntent`, `syncPaymentIntent` |
| Payments | `api.pay.listPayments`, `getPayment`, `cancelPayment`, `capturePayment` |
| Payment methods | `api.pay.listPaymentMethods`, `createPaymentMethod`, `createPaymentMethodDirect`, `getPaymentMethod`, `listPaymentMethodsByCustomer`, `updatePaymentMethod`, `deletePaymentMethod`, `updatePaymentMethodBillingAddress` |
| Addresses | `api.pay.createAddress`, `listAddresses`, `getAddress`, `updateAddress`, `deleteAddress` |
| Customers | `api.pay.createCustomer`, `listCustomers`, `getCustomer`, `updateCustomer`, `deleteCustomer` |
| Subscriptions | `api.pay.createSubscription`, `listSubscriptions`, `getSubscription`, `updateSubscription`, `cancelSubscription`, `updateSubscriptionBillingAddress` |
| Products, orders, invoices, receipts | `api.pay.listProducts`, `getProduct`, `listOrders`, `getOrder`, `createOrder`, `listInvoices`, `getInvoice`, `createInvoice`, `listReceipts`, `getReceipt` |
| Organizations and members | `api.pay.createOrganization`, `listOrganizations`, `getOrganization`, `updateOrganization`, `deleteOrganization`, `listOrganizationMembers`, `addOrganizationMember`, `updateOrganizationMemberRole`, `removeOrganizationMember`, `leaveOrganization` |
| Memberships | `api.pay.memberships.tiers`, `mine`, `list`, `get`, `cancel`, `user`, `access`, `projects` |
| Projects and invites | `api.pay.projects.list`, `create`, `get`, `update`, `delete`, `invites`, `invite`, `acceptInvite` |
| Account balance | `api.pay.listMyBalances`, `listUserBalances`, `getMyBalanceTotal`, `getUserBalanceTotal`, `getBalance`, `createBalance`, `updateBalance`, `deleteBalance`, `creditBalance`, `debitBalance`, `getBalanceTransactions`, `getBalanceStatistics`, `listExpiringBalances` |
| Billing schedules | `api.pay.listMySchedules`, `listActiveSchedules`, `listDueSchedules`, `listUserSchedules`, `getSchedule`, `createSchedule`, `updateSchedule`, `pauseSchedule`, `resumeSchedule`, `cancelSchedule`, `deleteSchedule`, `getScheduleExecutions`, `getScheduleStatistics`, `listFailedScheduleExecutions` |
| Cost tracking | `api.pay.getProductCosts`, `getActiveProductCost`, `getTotalProductCost`, `createProductCost`, `updateProductCost`, `deleteProductCost`, `closeProductCost`, `getOrderCosts`, `getOrderCost`, `getTotalOrderCost`, `createOrderCost`, `getSubscriptionCost`, `getProfitability`, `getLowMargins`, `getLosses`, `getTopProfitable` |
| Webhooks | `api.pay.webhooks.list`, `create`, `get`, `update`, `delete`, `test`, `deliveries` |
| External webhooks | `api.pay.externalWebhooks.receive`, `stripe`, `paypal`, `polar`, `azul` |
| Admin | `api.pay.admin.overview`, `stats`, `payments`, `cache`, `clearCache`, `health`, `testNotification`, `notificationConfig`, `updateNotificationConfig`, `products`, `syncProducts`, `subscriptions`, `memberships`, `applePayDomains`, `addApplePayDomain`, `deleteApplePayDomain` |
| Module hub and renewals | `api.pay.moduleHub.plugins`, `plugin`, `install`, `uninstall`, `api.pay.renewals.list`, `get`, `run` |
| Hosted pages and embeds | `api.pay.hosted.*Url` helpers for pages, portal, payment methods, subscriptions, invoices, and embeds |
| Callbacks and health | `api.pay.callbacks.*`, `api.pay.health.basic`, `detailed`, `database`, `providers`, `flowless`, `ready`, `live`, `metrics` |

## Ultra Forms

| Route family | Client methods |
| --- | --- |
| Health and branding | `api.forms.health`, `api.forms.getBranding` |
| Forms | `api.forms.listForms`, `createForm`, `getForm`, `getFormByCode`, `getFormLanguages`, `updateForm`, `deleteForm`, `publishForm`, `unpublishForm`, `duplicateForm` |
| Submissions | `api.forms.submitForm`, `submitByCode`, `submitTicket`, `listSubmissions`, `getSubmissionCounts`, `getReviewStatus`, `getStatusHistory`, `api.forms.submissions.get`, `delete` |
| Analytics | `api.forms.analytics.getForm`, `metrics`, `compute` |
| Drafts | `api.forms.drafts.list`, `save`, `stats`, `get`, `update`, `delete`, `convert` |
| Webhooks | `api.forms.webhooks.list`, `create`, `get`, `delete`, `test`, `logs` |
| Workflows | `api.forms.workflows.list`, `create`, `get`, `trigger`, `history`, `execution` |
| Assignments, teams, agents | `api.forms.assignments.*`, `api.forms.teams.*`, `api.forms.agents.*` |
| Tickets | `api.forms.tickets.list`, `create`, `get`, `update`, `delete`, `status`, `comments`, `addComment`, `submission` |
| Leads | `api.forms.leads.list`, `create`, `hot`, `get`, `update`, `delete`, `qualify`, `disqualify`, `assign`, `recalculate` |
| Forums | `api.forms.forums.boards`, `threads`, `createThread`, `getThread`, `posts`, `createPost`, `votePost`, `moderateThread`, `moderatePost` |
| Lists and newsletters | `api.forms.lists.subscribe`, `confirm`, `unsubscribe`, `create`, `list`, `events`, `get`, `update`, `delete`, `adminSubscribe`, `subscribers`, `updateSubscription`, `adminUnsubscribe`, `adminConfirm` |
| Module hub | `api.forms.modules.status`, `dryRun`, `run`, `list`, `moduleStatus`, `moduleDryRun`, `moduleRun`, `registry`, `updateDryRun`, `update` |
| Embeds and views | `api.forms.embeds.url`, `code`, `previewUrl`, `api.forms.views.formUrl`, `successUrl`, `closedUrl` |

`@pubflow/react`, `@pubflow/react-native`, and `@pubflow/flowfull-client` expose the same module shape through `useBridgePayments`, `useUltraForms`, `api.pay`, and `api.forms`.
