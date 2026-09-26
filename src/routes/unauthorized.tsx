import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Access restricted — EMFSC" },
      { name: "description", content: "You do not have permission to view this portal." },
      { property: "og:title", content: "Access restricted — EMFSC" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Unauthorized,
});

function Unauthorized() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold text-foreground">Restricted</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your current role doesn't include permission for this portal. Switch roles from the
          selector in the header, or return home.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
