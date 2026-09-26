import { createFileRoute, Link } from "@tanstack/react-router";
import { ROLES } from "@/lib/emfsc-data";
import { useRole } from "@/lib/role-context";
import type { RoleId } from "@/lib/emfsc-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EMFSC Curriculum & Task Bank" },
      { name: "description", content: "Role-based curriculum task bank and pacing system for EMFSC reading batches." },
      { property: "og:title", content: "EMFSC Curriculum & Task Bank" },
      { property: "og:description", content: "Role-based curriculum task bank and pacing system for EMFSC reading batches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function destinationFor(role: RoleId): { to: string; params?: Record<string, string> } {
  const def = ROLES.find((r) => r.id === role)!;
  if (role === "super_admin") return { to: "/admin/curriculum" };
  if (role.startsWith("batch_admin")) return { to: "/batch/$batchId/curriculum", params: { batchId: def.batchId! } };
  if (role.startsWith("pace_")) return { to: "/pace/$batchId/$groupId", params: { batchId: def.batchId!, groupId: def.groupId! } };
  return { to: "/unauthorized" };
}

function Index() {
  const { role, setRole } = useRole();
  const dest = destinationFor(role);

  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          Prototype — Role-Based Authorization & Curriculum Task Bank
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          One global task bank. Many batches, many paces.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Pioneer batches author daily reading tasks; follower batches inherit them from the Global
          Curriculum Task Bank keyed by book, pace tier, and step. Pick a role below to enter its portal.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              role === r.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-card-foreground hover:border-primary/50"
            }`}
          >
            <p className="text-sm font-semibold">{r.label}</p>
            <p className={`mt-1 text-xs ${role === r.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {r.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Link
          to={dest.to as never}
          params={dest.params as never}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Enter as {ROLES.find((r) => r.id === role)?.label} →
        </Link>
      </div>
    </main>
  );
}
