import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import styleUrl from "../style.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "TanStack Start on Convex" },
      ],
      links: [{ rel: "stylesheet", href: styleUrl }],
    }),
    component: Root,
    notFoundComponent: () => (
      <main>
        <h1>Page not found</h1>
        <Link to="/">Back to listings</Link>
      </main>
    ),
  },
);

function Root() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
