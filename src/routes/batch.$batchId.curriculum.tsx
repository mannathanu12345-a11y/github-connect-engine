import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ASSIGNMENTS,
  BOOKS,
  DUTY_LABELS,
  assignmentsFor,
  batchById,
  bookById,
  groupsForBatch,
} from "@/lib/emfsc-data";
import type { Duty } from "@/lib/emfsc-types";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/batch/$batchId/curriculum")({
  head: () => ({
    meta: [
      { title: "Batch Admin Portal — EMFSC" },
      { name: "description", content: "Configure batch calendar, assign pace admins, and monitor the batch roadmap." },
      { property: "og:title", content: "Batch Admin Portal — EMFSC" },
      { property: "og:description", content: "Configure batch calendar, assign pace admins, and monitor the batch roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BatchPortal,
});

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_DUTIES: Duty[] = ["daily_task", "reflection", "inspiration", "attendance"];

function BatchPortal() {
  const { batchId } = Route.useParams();
  const { role } = useRole();
  const navigate = useNavigate();
  const batch = batchById(batchId);

  const [readingDays, setReadingDays] = useState<string[]>(batch?.readingDays ?? []);
  const [offsets, setOffsets] = useState(batch?.offsets ?? []);
  const [newOffset, setNewOffset] = useState({ title: "", startDate: "", days: 3 });
  const [assignments, setAssignments] = useState(ASSIGNMENTS);

  const allowed =
    (role === "batch_admin_1" && batchId === "batch-1") ||
    (role === "batch_admin_2" && batchId === "batch-2");

  if (!batch) {
    navigate({ to: "/" });
    return null;
  }
  if (!allowed) {
    navigate({ to: "/unauthorized" });
    return null;
  }

  const groups = groupsForBatch(batchId);

  const toggleDay = (d: string) =>
    setReadingDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const toggleDuty = (asId: string, duty: Duty) =>
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === asId
          ? { ...a, duties: a.duties.includes(duty) ? a.duties.filter((x) => x !== duty) : [...a.duties, duty] }
          : a,
      ),
    );

  const setBookLock = (asId: string, bookId: string) =>
    setAssignments((prev) =>
      prev.map((a) => (a.id === asId ? { ...a, assignedBookId: bookId || null } : a)),
    );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">{batch.name}</h1>
          <p className="text-xs text-muted-foreground">
            Starts {batch.startDate} · Reading days: {readingDays.join(", ") || "none set"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          batch.status === "active" ? "bg-teal text-teal-foreground" : "bg-muted text-muted-foreground"
        }`}>
          {batch.status}
        </span>
      </div>

      {/* Section 1: Calendar & Offsets */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Batch Calendar & Offsets</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-bold text-muted-foreground">READING DAYS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    readingDays.includes(d) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-bold text-muted-foreground">BREAKS / OFFSETS</p>
            <ul className="mt-2 space-y-1">
              {offsets.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs">
                  <span className="font-medium text-foreground">{o.title} — {o.startDate}</span>
                  <span className="font-bold text-primary">+{o.days}d</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <input className="w-32 rounded-md border border-input bg-background px-2 py-1 text-xs" placeholder="Title" value={newOffset.title} onChange={(e) => setNewOffset({ ...newOffset, title: e.target.value })} />
              <input type="date" className="rounded-md border border-input bg-background px-2 py-1 text-xs" value={newOffset.startDate} onChange={(e) => setNewOffset({ ...newOffset, startDate: e.target.value })} />
              <input type="number" min={1} className="w-16 rounded-md border border-input bg-background px-2 py-1 text-xs" value={newOffset.days} onChange={(e) => setNewOffset({ ...newOffset, days: +e.target.value })} />
              <button
                onClick={() => {
                  if (!newOffset.title || !newOffset.startDate) return;
                  setOffsets((p) => [...p, { id: `off-${Date.now()}`, ...newOffset }]);
                  setNewOffset({ title: "", startDate: "", days: 3 });
                }}
                className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
              >
                Add break
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Pace Group Roster */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Pace Group Roster & Admin Assignments</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {groups.map((g) => {
            const admins = assignmentsFor(batchId, g.id).map((a) => assignments.find((x) => x.id === a.id)!);
            return (
              <div key={g.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-card-foreground">{g.tier}-Page Group</p>
                  <span className="text-xs text-muted-foreground">{g.memberCount} members</span>
                </div>
                <div className="mt-3 space-y-3">
                  {admins.map((a) => (
                    <div key={a.id} className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-semibold text-foreground">{a.adminName}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ALL_DUTIES.map((d) => (
                          <button
                            key={d}
                            onClick={() => toggleDuty(a.id, d)}
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              a.duties.includes(d) ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border border-border"
                            }`}
                          >
                            {DUTY_LABELS[d]}
                          </button>
                        ))}
                      </div>
                      <select
                        value={a.assignedBookId ?? ""}
                        onChange={(e) => setBookLock(a.id, e.target.value)}
                        className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                      >
                        <option value="">No book lock</option>
                        {BOOKS.map((b) => (
                          <option key={b.id} value={b.id}>Lock to: {b.title}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {admins.length === 0 && (
                    <p className="text-xs text-muted-foreground">No pace admins assigned yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Batch Roadmap */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Batch Roadmap</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card p-4">
          <div className="min-w-[640px]">
            <div className="mb-2 flex gap-1 pl-20">
              {BOOKS.map((b) => (
                <div key={b.id} className="flex-1 text-center text-[10px] font-semibold text-muted-foreground">
                  Slot {b.slot}
                </div>
              ))}
            </div>
            {groups.map((g) => {
              const book = bookById(g.currentBookId)!;
              const totalSteps = Math.ceil(book.pagesEN / g.tier);
              const progress = Math.min(100, Math.round((g.currentStep / totalSteps) * 100));
              return (
                <div key={g.id} className="mb-3 flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-muted-foreground">{g.tier} pg/day</span>
                  <div className="relative flex flex-1 gap-1">
                    {BOOKS.map((b) => (
                      <div key={b.id} className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                        {b.slot < book.slot && <div className="absolute inset-0 bg-teal" />}
                        {b.slot === book.slot && (
                          <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${progress}%` }} />
                        )}
                      </div>
                    ))}
                    {/* Today marker */}
                    <div className="absolute inset-y-0 w-0.5 bg-destructive" style={{ left: "55%" }} />
                  </div>
                  <span className="w-36 truncate text-right text-xs text-muted-foreground">
                    {book.title} · {progress}%
                  </span>
                </div>
              );
            })}
            <p className="mt-1 pl-20 text-[10px] text-muted-foreground">▲ red line = today</p>
          </div>
        </div>
      </section>
    </main>
  );
}
