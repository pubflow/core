# Multi-Backend Modules

`@pubflow/core` can talk to the main Flowless API, Bridge Payments, and Ultra Forms from one friendly client. Each backend can live on the same host or on separate hosts owned by the application.

```ts
import { createPubflow } from '@pubflow/core';

const pubflow = createPubflow({
  apiUrl: 'https://flowless.example.com',
  paymentsUrl: 'https://payments.example.com',
  formsUrl: 'https://forms.example.com',
});

await pubflow.blog.listPosts({ lang: 'en' });
await pubflow.payments.createPaymentIntent({
  total_cents: 2500,
  currency: 'USD',
  provider_id: 'stripe_main',
});
await pubflow.forms.submitByCode('contact', {
  name: 'Ada',
  email: 'ada@example.com',
});
```

## Defaults

If `paymentsUrl` or `formsUrl` is omitted, the client falls back to `apiUrl`/`baseUrl`.

Default module prefixes:

- Bridge Payments: `/bridge-payment`
- Ultra Forms: `/api/v1`
- Blog: `/api/v1/posts`
- Onboarding: `/api/v1/onboarding`

Override them when your backend is mounted differently:

```ts
const pubflow = createPubflow({
  apiUrl: 'https://api.example.com',
  modulePrefixes: {
    payments: '/billing',
    forms: '/forms-api/v1',
    blog: '/content/posts',
  },
});
```

## Escape Hatch

Every module client keeps raw request methods for endpoints that do not yet have a friendly helper:

```ts
const result = await pubflow.forms.get('/analytics/forms/form_123');
const custom = await pubflow.blog.post('/custom-route', { enabled: true });
```
