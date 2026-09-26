import type { TaskContent } from "@/lib/emfsc-types";

interface Props {
  task: TaskContent;
  bookTitle: string;
  slot: number;
  author: string;
  day: number;
  batchTag: string;
  paceTag: string;
  adminName: string;
}

export function TelegramPreview({ task, bookTitle, slot, author, day, batchTag, paceTag, adminName }: Props) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-border bg-ivory p-5 shadow-lg">
      <p className="text-sm font-bold text-ivory-foreground">📚 EMFSC Daily Reading — Day {day}</p>
      <div className="mt-3 rounded-2xl bg-background/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ivory-foreground">{bookTitle}</p>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Slot {slot}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{author}</p>
      </div>
      <div className="mt-3 space-y-1 text-xs text-ivory-foreground">
        <p>🇬🇧 English Edition: pp {task.enStart} – {task.enEnd}</p>
        <p>🇪🇹 Amharic Edition: ገጽ {task.amStart} – {task.amEnd}</p>
      </div>
      <div className="mt-3">
        <p className="text-xs font-bold text-ivory-foreground">📖 Core Highlights</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ivory-foreground/90">
          {task.highlights.filter(Boolean).map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <p className="text-xs font-bold text-ivory-foreground">💡 Key Reflection Question</p>
        <p className="mt-1 text-xs italic text-ivory-foreground/90">{task.reflection}</p>
      </div>
      <p className="mt-3 text-xs text-ivory-foreground">⏰ {task.deadline}</p>
      {task.adminNote && (
        <p className="mt-2 rounded-lg bg-accent/60 p-2 text-[11px] text-accent-foreground">📝 {task.adminNote}</p>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span>#{batchTag} #{paceTag}</span>
        <span>— {adminName}</span>
      </div>
    </div>
  );
}
