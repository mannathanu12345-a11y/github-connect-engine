import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BATCHES, BOOKS, PACE_GROUPS, REVISIONS, TASK_BANK, bookById } from "@/lib/emfsc-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/admin/curriculum")({
  head: () => ({
    meta: [
      { title: "Super Admin — Global Curriculum — EMFSC" },
      { name: "description", content: "Manage the global book catalog, review task bank revisions, and monitor cross-batch progression." },
      { property: "og:title", content: "Super Admin — Global Curriculum — EMFSC" },
      { property: "og:description", content: "Manage the global book catalog, review task bank revisions, and monitor cross-batch progression." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCurriculum,
});

function AdminCurriculum() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [books, setBooks] = useState([...BOOKS].sort((a, b) => a.slot - b.slot));
  const [revisions, setRevisions] = useState(REVISIONS);
  const [openRev, setOpenRev] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", pagesEN: 100, pagesAM: 120 });

  if (role !== "super_admin") {
    navigate({ to: "/unauthorized" });
    return null;
  }

  const move = (id: string, dir: -1 | 1) => {
    setBooks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const a = next[idx]!;
      next[idx] = next[j]!;
      next[j] = a;
      return next.map((b, i) => ({ ...b, slot: i + 1 }));
    });
  };

  const resolveRevision = (id: string, status: "accepted" | "local" | "rejected") =>
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const pending = revisions.filter((r) => r.status === "pending");
  const activeBatches = BATCHES.filter((b) => b.status === "active");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Books in catalog", value: books.length },
          { label: "Active batches", value: activeBatches.length },
          { label: "Bank tasks", value: TASK_BANK.length },
          { label: "Pending revisions", value: pending.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section 1: Global Book Catalog */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Global Book Catalog</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            + Add Book
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-xs text-muted-foreground">
                <th className="px-3 py-2">Slot</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Pages (EN/AM)</th>
                <th className="px-3 py-2">Active batches</th>
                <th className="px-3 py-2">Reorder</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b, i) => {
                const active = PACE_GROUPS.filter((g) => g.currentBookId === b.id).length;
                return (
                  <tr key={b.id} className="border-b border-border bg-card last:border-0">
                    <td className="px-3 py-2 font-bold text-primary">{b.slot}</td>
                    <td className="px-3 py-2 font-medium text-card-foreground">{b.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{b.author}</td>
                    <td className="px-3 py-2 text-muted-foreground">{b.pagesEN} / {b.pagesAM}</td>
                    <td className="px-3 py-2 text-muted-foreground">{active}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button disabled={i === 0} onClick={() => move(b.id, -1)} className="rounded border border-border px-2 py-0.5 text-xs disabled:opacity-30">↑</button>
                        <button disabled={i === books.length - 1} onClick={() => move(b.id, 1)} className="rounded border border-border px-2 py-0.5 text-xs disabled:opacity-30">↓</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Task Bank & Revision Inbox */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">Global Task Bank — Revision Inbox</h2>
        {pending.length === 0 && (
          <p className="mt-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No pending revisions. Inbox zero. 🎉
          </p>
        )}
        <div className="mt-3 space-y-3">
          {revisions.map((r) => {
            const current = TASK_BANK.find(
              (x) => x.bookId === r.bookId && x.paceTier === r.paceTier && x.stepNumber === r.stepNumber,
            );
            const book = bookById(r.bookId);
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {book?.title} — {r.paceTier}pg pace, Step {r.stepNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Proposed by {r.proposedBy} ({r.batchName})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      r.status === "pending" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {r.status}
                    </span>
                    <button
                      onClick={() => setOpenRev(openRev === r.id ? null : r.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
                    >
                      {openRev === r.id ? "Hide diff" : "View diff"}
                    </button>
                  </div>
                </div>
                {openRev === r.id && current && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-bold text-muted-foreground">CURRENT BANK CONTENT</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{current.title}</p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                        {current.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                      <p className="mt-1 text-xs italic text-muted-foreground">{current.reflection}</p>
                    </div>
                    <div className="rounded-lg bg-accent/50 p-3">
                      <p className="text-xs font-bold text-accent-foreground">PROPOSED REVISION</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{r.proposed.title}</p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-foreground/80">
                        {r.proposed.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                      <p className="mt-1 text-xs italic text-foreground/80">{r.proposed.reflection}</p>
                    </div>
                  </div>
                )}
                {r.status === "pending" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => resolveRevision(r.id, "accepted")} className="rounded-md bg-teal px-3 py-1.5 text-xs font-semibold text-teal-foreground hover:opacity-90">
                      Accept as New Global Standard
                    </button>
                    <button onClick={() => resolveRevision(r.id, "local")} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                      Keep as Batch-Local Only
                    </button>
                    <button onClick={() => resolveRevision(r.id, "rejected")} className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Cross-Batch Progression Radar */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">Cross-Batch Progression Radar</h2>
        <div className="mt-3 space-y-3">
          {BATCHES.map((batch) => {
            const groups = PACE_GROUPS.filter((g) => g.batchId === batch.id);
            return (
              <div key={batch.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-card-foreground">{batch.name}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{batch.status}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {groups.map((g) => {
                    const book = bookById(g.currentBookId)!;
                    return (
                      <div key={g.id} className="flex items-center gap-3">
                        <span className="w-16 text-xs font-medium text-muted-foreground">{g.tier} pg/day</span>
                        <div className="flex flex-1 gap-1">
                          {books.map((b) => (
                            <div
                              key={b.id}
                              title={`Slot ${b.slot}: ${b.title}`}
                              className={`h-3 flex-1 rounded-sm ${
                                b.slot < book.slot
                                  ? "bg-teal"
                                  : b.slot === book.slot
                                    ? "bg-primary"
                                    : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="w-28 truncate text-right text-xs text-muted-foreground">
                          {book.title} · step {g.currentStep}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Book modal */}
      {showAdd && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-base font-bold text-card-foreground">Add Book to Catalog</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} />
              <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Author" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} />
              <div className="flex gap-3">
                <label className="flex-1 text-xs text-muted-foreground">Pages (EN)
                  <input type="number" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newBook.pagesEN} onChange={(e) => setNewBook({ ...newBook, pagesEN: +e.target.value })} />
                </label>
                <label className="flex-1 text-xs text-muted-foreground">Pages (AM)
                  <input type="number" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newBook.pagesAM} onChange={(e) => setNewBook({ ...newBook, pagesAM: +e.target.value })} />
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground">Cancel</button>
              <button
                onClick={() => {
                  if (!newBook.title.trim()) return;
                  setBooks((prev) => [...prev, { id: `book-${Date.now()}`, slot: prev.length + 1, ...newBook }]);
                  setShowAdd(false);
                  setNewBook({ title: "", author: "", pagesEN: 100, pagesAM: 120 });
                }}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
