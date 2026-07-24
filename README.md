# `@inklethq/sdk`

Official server-side JavaScript and TypeScript SDK for Inklet.

> v0.1 alpha foundation: client initialization, Project Secret Key/PAT
> authentication, and safe error handling. Display, Push, Content,
> Presentation, Preview, and Webhook resource APIs will build on this
> transport.

## Requirements

- Node.js 20 or newer
- A project-scoped Inklet Project Secret Key
- A trusted server environment (Node.js service, serverless function,
  automation script, or controlled local service)

Project Secret Keys must not be used in browser bundles. The SDK detects a
browser runtime and throws before sending a request.

## Install

```sh
npm install @inklethq/sdk@alpha
```

## Initialize

```ts
import { Inklet } from "@inklethq/sdk";

const inklet = new Inklet({
  secretKey: process.env.INKLET_PROJECT_SECRET_KEY!,
});
```

The same package also works from CommonJS JavaScript:

```js
const { Inklet } = require("@inklethq/sdk");

const inklet = new Inklet({
  secretKey: process.env.INKLET_PROJECT_SECRET_KEY,
});
```

`pat` is accepted as a compatibility alias:

```ts
const inklet = new Inklet({
  pat: process.env.INKLET_PAT!,
});
```

Client construction validates configuration but does not make a network
request. The first feature call performs the first request.

The default service address is `https://dev.iminklet.com`, matching the
[current Inklet backend API documentation](https://docs-dev.iminklet.com/api/).
Keep the documented `/api/*` prefix in request paths:

```ts
const devices = await inklet.request("/api/devices");
```

For a controlled local service or test server, override the API base URL:

```ts
const inklet = new Inklet({
  secretKey: process.env.INKLET_PROJECT_SECRET_KEY!,
  baseUrl: "http://127.0.0.1:8787/v1",
});
```

## Foundation transport

Resource modules use the authenticated request transport:

```ts
const displays = await inklet.request<{ data: Array<{ id: string }> }>(
  "/api/devices",
);
```

Every request:

- uses `Authorization: Bearer <Project Secret Key>`;
- refuses absolute request URLs to prevent credentials being sent to another
  origin;
- refuses cross-origin redirects;
- never includes the full credential in SDK error messages;
- preserves `x-request-id`, `request-id`, or `x-correlation-id` on errors.

Authentication, authorization, network, rate-limit, API, and invalid-response
failures use distinct error classes:

```ts
import {
  InvalidSecretKeyError,
  PermissionDeniedError,
  RevokedSecretKeyError,
} from "@inklethq/sdk";

try {
  await inklet.request("/api/devices");
} catch (error) {
  if (error instanceof RevokedSecretKeyError) {
    // Rotate the Project Secret Key.
  } else if (error instanceof InvalidSecretKeyError) {
    // Check the configured project and credential.
  } else if (error instanceof PermissionDeniedError) {
    // The credential is valid, but the project cannot access this resource.
  }
}
```

## Development

```sh
npm ci
npm run check
npm run pack:check
```

`npm run check` runs strict TypeScript checking, unit tests, and the ESM/CJS
build.
