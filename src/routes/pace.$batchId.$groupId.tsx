import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BOOKS,
  assignmentsFor,
  batchById,
  bookById,
  findBankTask,
  groupById,
} from "@/lib/emfsc-data";
import type { TaskContent } from "@/lib/emfsc-types";
import { useRole } from "@/lib/role-context";
import { TelegramPreview } from "@/components/emfsc/TelegramPreview";

export const Route = createFileRoute("/pace/$batchId/$groupId")({
  head: () => ({
    meta: [
      { title: "Pace Admin Workspace — EMFSC" },
      { name: "description", content: "Draft, approve, and publish daily reading tasks with a live Telegram preview." },
      { property: "og:title", content: "Pace Admin Workspace — EMFSC" },
      { property: "og:description", content: "Draft, approve, and publish daily reading tasks with a live Telegram preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaceWorkspace,
});

const emptyTask = (tier: number, step: number): TaskContent => ({
  title: "",
  enStart: (step - 1) * tier + 1,
  enEnd: step * tier,
  amStart: (step - 1) * tier + 1,
  amEnd: step * tier,
  highlights: ["", "", ""],
  reflection: "",
  deadline: "Submit reflection by 9:00 PM EAT",
  adminNote: "",
});

function PaceWorkspace() {
  const { batchId, groupId } = Route.useParams();
  const { role } = useRole();
  const navigate = useNavigate();

  const batch = batchById(batchId);
  const group = groupById(groupId);

  const isPaceRole = role === "pace_pioneer" || role === "pace_follower" || role === "pace_restricted";
  const roleMatches =
    (role === "pace_pioneer" && batchId === "batch-1" && groupId === "b1-g10") ||
    ((role === "pace_follower" || role === "pace_restricted") && batchId === "batch-2" && groupId === "b2-g10");

  const myAssignment = useMemo(() => {
    if (role === "pace_pioneer") return assignmentsFor(batchId, groupId).find((a) => a.adminName === "Ustadh Bilal");
    if (role === "pace_follower") return assignmentsFor(batchId, groupId).find((a) => a.adminName === "Sr. Maryam");
    if (role === "pace_restricted") return assignmentsFor(batchId, groupId).find((a) => a.adminName === "Br. Khalid");
    return undefined;
  }, [role, batchId, groupId]);

  const book = group ? bookById(group.currentBookId) : undefined;
  const bankTask = book && group ? findBankTask(book.id, group.tier, group.currentStep) : undefined;
  const isPioneer = !bankTask;
  const hasDailyDuty = myAssignment?.duties.includes("daily_task") ?? false;
  const bookLocked =
    myAssignment?.assignedBookId != null && myAssignment.assignedBookId !== book?.id;
  const dailyTaskOwner = assignmentsFor(batchId, groupId).find((a) => a.duties.includes("daily_task"));

  const [task, setTask] = useState<TaskContent>(() =>
    bankTask ? { ...bankTask } : emptyTask(group?.tier ?? 10, group?.currentStep ?? 1),
  );
  const [mode, setMode] = useState<"review" | "local-edit" | "propose">("review");
  const [published, setPublished] = useState(false);
  const [proposed, setProposed] = useState(false);
  const [showHandover, setShowHandover] = useState(false);

  if (!batch || !group || !book) {
    navigate({ to: "/" });
    return null;
  }
  if (!isPaceRole || !roleMatches) {
    navigate({ to: "/unauthorized" });
    return null;
  }

  const readOnly = !hasDailyDuty || bookLocked;
  const canEdit = hasDailyDuty && !bookLocked && (isPioneer || mode !== "review");
  const totalSteps = Math.ceil(book.pagesEN / group.tier);
  const isBookComplete = group.currentStep >= totalSteps;
  const nextBook = BOOKS.find((b) => b.slot === book.slot + 1);

  const set = (patch: Partial<TaskContent>) => setTask((p) => ({ ...p, ...patch }));
  const setHighlight = (i: number, v: string) =>
    setTask((p) => ({ ...p, highlights: p.highlights.map((h, j) => (j === i ? v : h)) }));

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">
            {batch.name} — {group.tier}-Page Group
          </h1>
          <p className="text-xs text-muted-foreground">
            Current book: {book.title} · Duties:{" "}
            {myAssignment?.duties.map((d) => d.replace("_", " ")).join(", ") || "none"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPioneer ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
          {isPioneer ? "Pioneer — authoring from scratch" : "Follower — inheriting from bank"}
        </span>
      </div>

      {/* Section 1: Book Sequence Stepper */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Book Sequence</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {BOOKS.map((b, i) => {
            const state =
              b.slot < book.slot ? "done" : b.slot === book.slot ? "current" : "upcoming";
            const lockedByOther =
              b.slot > book.slot &&
              assignmentsFor(batchId, groupId).some((a) => a.assignedBookId === b.id);
            return (
              <div key={b.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    state === "done"
                      ? "bg-teal text-teal-foreground"
                      : state === "current"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span>{state === "done" ? "✓" : `Step ${b.slot}`}</span>
                  <span>{b.title}</span>
                  {lockedByOther && <span className="opacity-75">🔒</span>}
                </div>
                {i < BOOKS.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Today's Task Card */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">
          Today's Task — Step {group.currentStep} of {totalSteps}
        </h2>

        {!isPioneer && (
          <div className="mt-3 rounded-xl border border-accent bg-accent/40 p-3 text-sm text-accent-foreground">
            Pre-loaded from Global Bank (created by {bankTask?.createdByBatch}). Review and approve.
          </div>
        )}
        {bookLocked && (
          <div className="mt-3 rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
            This book is managed by another admin. Your assignment is locked to a different book.
          </div>
        )}

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <input className={inputCls} placeholder="Task title" value={task.title} disabled={!canEdit} onChange={(e) => set({ title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-muted-foreground">🇬🇧 EN pages
                <div className="mt-1 flex gap-2">
                  <input type="number" className={inputCls} value={task.enStart} disabled={!canEdit} onChange={(e) => set({ enStart: +e.target.value })} />
                  <input type="number" className={inputCls} value={task.enEnd} disabled={!canEdit} onChange={(e) => set({ enEnd: +e.target.value })} />
                </div>
              </label>
              <label className="text-xs text-muted-foreground">🇪🇹 AM ገጽ
                <div className="mt-1 flex gap-2">
                  <input type="number" className={inputCls} value={task.amStart} disabled={!canEdit} onChange={(e) => set({ amStart: +e.target.value })} />
                  <input type="number" className={inputCls} value={task.amEnd} disabled={!canEdit} onChange={(e) => set({ amEnd: +e.target.value })} />
                </div>
              </label>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">📖 Core highlights</p>
              {task.highlights.map((h, i) => (
                <input key={i} className={`${inputCls} mt-1.5`} placeholder={`Highlight ${i + 1}`} value={h} disabled={!canEdit} onChange={(e) => setHighlight(i, e.target.value)} />
              ))}
            </div>
            <textarea className={inputCls} rows={2} placeholder="💡 Reflection question" value={task.reflection} disabled={!canEdit} onChange={(e) => set({ reflection: e.target.value })} />
            <input className={inputCls} placeholder="⏰ Deadline" value={task.deadline} disabled={!canEdit} onChange={(e) => set({ deadline: e.target.value })} />
            <textarea className={inputCls} rows={2} placeholder="Admin note (optional)" value={task.adminNote} disabled={!canEdit} onChange={(e) => set({ adminNote: e.target.value })} />

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {readOnly ? (
                <span className="rounded-md bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                  View Only — Assigned to {dailyTaskOwner?.adminName ?? "another admin"}
                </span>
              ) : isPioneer ? (
                <button
                  onClick={() => setPublished(true)}
                  className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Publish to Batch & Save to Global Bank
                </button>
              ) : (
                <>
                  <button onClick={() => { setMode("review"); setPublished(true); }} className="rounded-md bg-teal px-4 py-2 text-xs font-semibold text-teal-foreground hover:opacity-90">
                    Approve & Schedule
                  </button>
                  <button onClick={() => setMode("local-edit")} className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted">
                    Edit for This Batch Only
                  </button>
                  <button onClick={() => { setMode("propose"); setProposed(true); }} className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90">
                    Propose Edit to Super Admin
                  </button>
                </>
              )}
            </div>
            {published && (
              <p className="rounded-lg bg-teal/20 px-3 py-2 text-xs font-semibold text-foreground">
                ✓ {isPioneer ? "Published to batch and saved to the Global Task Bank." : "Approved and scheduled for this batch."}
              </p>
            )}
            {proposed && mode === "propose" && (
              <p className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground">
                ✓ Revision proposal sent to the Super Admin inbox.
              </p>
            )}
          </div>

          {/* Live preview */}
          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground">LIVE TELEGRAM PREVIEW</p>
            <TelegramPreview
              task={task}
              bookTitle={book.title}
              slot={book.slot}
              author={book.author}
              day={group.currentStep}
              batchTag={batch.name.split(" ")[0] + batch.name.split(" ")[1]}
              paceTag={`Pace${group.tier}`}
              adminName={myAssignment?.adminName ?? "Pace Admin"}
            />
          </div>
        </div>
      </section>

      {/* Section 3: Book Completion Handover */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Book Completion Handover</h2>
        <div className="mt-3 rounded-xl border border-border bg-card p-5">
          {isBookComplete ? (
            <>
              <p className="text-sm font-semibold text-card-foreground">🎉 Book Complete — {book.title}</p>
              {nextBook && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Next up: Slot {nextBook.slot} — {nextBook.title} by {nextBook.author}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {totalSteps - group.currentStep} steps remain in {book.title}. The handover unlocks when the
              group reaches the final page.
            </p>
          )}
          {nextBook && (
            <button
              onClick={() => setShowHandover(true)}
              disabled={!isBookComplete}
              className="mt-3 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              Start Next Book: {nextBook.title}
            </button>
          )}
        </div>
      </section>

      {/* Handover confirmation modal */}
      {showHandover && nextBook && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-base font-bold text-card-foreground">Advance to {nextBook.title}?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This moves the {group.tier}-page group to Slot {nextBook.slot}, Step 1. This never happens
              automatically — confirm to advance the reading cursor.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowHandover(false)} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground">Cancel</button>
              <button onClick={() => setShowHandover(false)} className="rounded-md bg-teal px-3 py-1.5 text-xs font-semibold text-teal-foreground">
                Confirm — Start {nextBook.title}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
