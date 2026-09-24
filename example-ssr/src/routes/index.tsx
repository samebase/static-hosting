import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useState } from "react";
import { api } from "../../convex/_generated/api.js";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data: listings } = useSuspenseQuery(
    convexQuery(api.listings.list, {}),
  );
  const [count, setCount] = useState(0);
  return (
    <main>
      <p className="eyebrow">Convex static hosting + TanStack Start</p>
      <h1>Rendered on the server. Live in your browser.</h1>
      <p>
        These public listings come from Convex. They are included in the first
        HTML response and stay subscribed after React hydrates.
      </p>
      {listings.length === 0 ? (
        <p>
          Run <code>npx convex run listings:seed</code> to add example data.
        </p>
      ) : (
        <ul className="listings">
          {listings.map((listing) => (
            <li key={listing.hostname}>
              <strong>{listing.hostname}</strong>
              <span>{listing.title}</span>
            </li>
          ))}
        </ul>
      )}
      <section>
        <h2>Hydrated in your browser</h2>
        <p>Update a listing in Convex. The counter keeps its value.</p>
        <button type="button" onClick={() => setCount((value) => value + 1)}>
          Clicks: {count}
        </button>
      </section>
      <footer>
        <Link to="/about">How this example works →</Link>
      </footer>
    </main>
  );
}
