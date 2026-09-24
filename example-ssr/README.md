# TanStack Start on Convex

This example renders TanStack Start inside Convex HTTP actions. Static Hosting
serves the browser assets. The homepage renders public database records into the
initial HTML, then hydrates React and keeps those records live through the
[official Convex TanStack Query integration](https://docs.convex.dev/client/tanstack/tanstack-start/).

The example has its own package and Convex schema. Its dependencies are separate
from the component's dependencies; no workspace setup is required. The original
[static React example](../example/) remains available.

## Run

Use Node 24. From the repository root:

```sh
npm ci
npm ci --prefix example-ssr
cd example-ssr
```

Select a dedicated development deployment for this example. Replace the team and
project placeholders with a project you own:

```sh
npx convex deployment create <team>:<project>:dev/static-hosting-ssr --type dev --select
```

Check `.env.local`: `CONVEX_DEPLOYMENT` must select that development deployment,
and `VITE_CONVEX_URL` must be its `.convex.cloud` URL. This schema is separate
from your existing application, so use a deployment dedicated to the example.

Build first, because the HTTP router imports the generated server bundle. Then
push the backend, seed the two public records, and upload the client files:

```sh
npm run build
npx convex dev --once
npx convex run listings:seed
npm run upload
```

Open the deployment's `.convex.site` URL. Both `/` and `/about` render on
Convex. For frontend development, run `npm run dev`; that Vite server runs SSR
locally. Use the `.convex.site` URL to exercise the Convex runtime and asset
serving.

After editing the app, repeat build, backend push, and upload. If the Convex URL
changes, rebuild so both bundles use the new URL. From the repository root,
`npm run build:example:ssr` builds this example; `npm run typecheck` and
`npm run lint` include it.

## Files and responsibilities

| File                       | Responsibility                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `convex/convex.config.ts`  | Installs Static Hosting without giving it ownership of the HTTP root.                                                                                               |
| `convex/http.ts`           | Registers static serving with an SSR fallback. Stored files win. Missing assets return 404. Other misses go to TanStack, which owns document routing and 404 pages. |
| `src/router.tsx`           | Creates fresh Convex and Query clients for each server request, connects live queries, and configures query hydration.                                              |
| `src/routes/index.tsx`     | Uses `useSuspenseQuery(convexQuery(...))` for both the initial HTML and subsequent live updates.                                                                    |
| `convex/listings.ts`       | Exposes a bounded public query for synthetic listings. Seed and rename operations are internal mutations.                                                           |
| `adapter/vite.ts`          | Bundles dependencies and selects runtime-compatible exports for the Convex server bundle.                                                                           |
| `adapter/server.ts`        | Renders TanStack with React's Web Stream renderer, waits for Suspense, and returns the complete HTML.                                                               |
| `convex/server-build.d.ts` | Describes Vite's generated server entry for typechecking before the first build.                                                                                    |

The uploader currently requires an `index.html`, even with `--no-spa`.
`public/index.html` supplies it and redirects explicit `/index.html` visits to
`/`. The `/` request itself has no exact stored file, so it reaches SSR.

## Why the adapter is included

TanStack's usual server entry assumes APIs that are unavailable in Convex HTTP
actions. These two small files make that runtime boundary explicit and can be
copied with the example. They do not install another Convex component or own
data.

- The build uses `worker` and `browser` export conditions to select Web API
  implementations, and `ssr.noExternal` to bundle dependencies.
- `react-dom/server.edge` avoids the browser renderer's `MessageChannel`
  dependency. The default TanStack streaming handler imports Node stream APIs;
  this entry uses React's Web Stream renderer and TanStack's HTML response
  helper.
- Awaiting `stream.allReady` ensures Suspense queries finish before sending the
  document. This implementation buffers the response; it does not stream chunks
  to the browser.
- The guarded `URLSearchParams.size` getter handles Convex runtimes that omit
  this property, which TanStack uses for query-string URL normalization.
- `node:async_hooks` remains in the bundle and is supported by Convex. The
  adapter does not make other Node-only dependencies compatible.

The two adapter files correspond to Scout's `@samebase/convex-tanstack-start`
workspace adapter. They live here as source so this example needs no private
package. Static Hosting's public API stays independent of TanStack.

## Verify

1. Inspect the response HTML for `/`. Both example hostnames should be inside
   list items before browser JavaScript runs.
2. Click the counter, navigate to About, and hard-refresh `/about`.
3. Return home, click the counter, then run this in the example directory:

   ```sh
   npx convex run listings:rename '{"title":"Updated without rebuilding"}'
   ```

   The listing should update without resetting the counter. A fresh response
   should contain the new title too. `listings:seed` restores the sample
   records.

4. Request `/assets/missing.js`. It should return a 404 without an HTML shell.
   An unknown document route should instead return TanStack's 404 page.
5. Compare response headers: documents use `Cache-Control: no-store`, while
   uploaded hashed JavaScript and CSS retain immutable caching.

## Deployment scope

This demonstrates public GET pages, query hydration, navigation, and live data.
Use Convex mutations and actions for writes. Authentication, personalized SSR,
and TanStack POST server functions are not configured in this example.

Backend deployment and asset publication are separate operations. This example
does not coordinate their versions or retain previous releases' assets. A
production rollout needs a release strategy for that gap, particularly while
older browser tabs remain open. The adapter alone does not solve deployment
consistency.

The local `file:..` dependency uses this checkout's component patches. To copy
the example to another repository, use a package build containing the `fallback`
API. The upstream `@convex-dev/static-hosting@0.2.1` release does not include
it.
