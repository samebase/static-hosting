import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About | TanStack Start on Convex" }] }),
  component: About,
});

function About() {
  return (
    <main>
      <p className="eyebrow">How it works</p>
      <h1>One app, served from Convex.</h1>
      <p>
        Static Hosting serves the JavaScript and CSS. When a document has no
        stored file, its fallback calls TanStack Start inside a Convex HTTP
        action.
      </p>
      <p>
        The adapter waits for React to finish rendering, then returns the HTML.
        TanStack hydrates it and handles navigation. The official Convex query
        integration keeps the listings live.
      </p>
      <p>
        Reload this page to check that direct links render on the server too.
      </p>
      <Link to="/">← Back to listings</Link>
    </main>
  );
}
