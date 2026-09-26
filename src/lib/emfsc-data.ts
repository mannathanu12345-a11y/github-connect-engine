import type {
  BankTask,
  Batch,
  Book,
  PaceAdminAssignment,
  PaceGroup,
  RevisionProposal,
  RoleDef,
} from "./emfsc-types";

export const BOOKS: Book[] = [
  { id: "book-1", slot: 1, title: "The Purification of the Soul", author: "Ibn Rajab al-Hanbali", pagesEN: 180, pagesAM: 210 },
  { id: "book-2", slot: 2, title: "Letters to a Young Student", author: "Sh. Ahmed Salim", pagesEN: 120, pagesAM: 145 },
  { id: "book-3", slot: 3, title: "The Gardens of the Righteous", author: "Imam an-Nawawi", pagesEN: 420, pagesAM: 480 },
  { id: "book-4", slot: 4, title: "Disciplining the Heart", author: "Ibn al-Qayyim", pagesEN: 260, pagesAM: 300 },
];

export const BATCHES: Batch[] = [
  {
    id: "batch-1",
    name: "Batch 1 — Pioneers",
    status: "active",
    startDate: "2026-08-03",
    readingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    offsets: [{ id: "off-1", title: "Eid Break", startDate: "2026-08-20", days: 3 }],
  },
  {
    id: "batch-2",
    name: "Batch 2 — Followers",
    status: "active",
    startDate: "2026-09-01",
    readingDays: ["Sun", "Tue", "Thu", "Sat"],
    offsets: [{ id: "off-2", title: "Exam Pause", startDate: "2026-09-15", days: 5 }],
  },
  {
    id: "batch-3",
    name: "Batch 3 — Evening Circle",
    status: "upcoming",
    startDate: "2026-10-05",
    readingDays: ["Mon", "Wed", "Fri"],
    offsets: [],
  },
];

export const PACE_GROUPS: PaceGroup[] = [
  { id: "b1-g5", batchId: "batch-1", tier: 5, currentBookId: "book-2", currentStep: 4, memberCount: 32 },
  { id: "b1-g10", batchId: "batch-1", tier: 10, currentBookId: "book-3", currentStep: 7, memberCount: 41 },
  { id: "b1-g20", batchId: "batch-1", tier: 20, currentBookId: "book-3", currentStep: 12, memberCount: 18 },
  { id: "b1-g40", batchId: "batch-1", tier: 40, currentBookId: "book-4", currentStep: 2, memberCount: 9 },
  { id: "b2-g5", batchId: "batch-2", tier: 5, currentBookId: "book-1", currentStep: 8, memberCount: 27 },
  { id: "b2-g10", batchId: "batch-2", tier: 10, currentBookId: "book-1", currentStep: 4, memberCount: 35 },
  { id: "b2-g20", batchId: "batch-2", tier: 20, currentBookId: "book-2", currentStep: 1, memberCount: 14 },
];

export const ASSIGNMENTS: PaceAdminAssignment[] = [
  { id: "as-1", batchId: "batch-1", groupId: "b1-g10", adminName: "Ustadh Bilal", duties: ["daily_task", "reflection"], assignedBookId: null },
  { id: "as-2", batchId: "batch-1", groupId: "b1-g10", adminName: "Sr. Hanna", duties: ["inspiration", "attendance"], assignedBookId: null },
  { id: "as-3", batchId: "batch-1", groupId: "b1-g20", adminName: "Br. Yusuf", duties: ["daily_task"], assignedBookId: "book-3" },
  { id: "as-4", batchId: "batch-2", groupId: "b2-g10", adminName: "Sr. Maryam", duties: ["daily_task", "attendance"], assignedBookId: null },
  { id: "as-5", batchId: "batch-2", groupId: "b2-g10", adminName: "Br. Khalid", duties: ["reflection", "inspiration"], assignedBookId: null },
  { id: "as-6", batchId: "batch-2", groupId: "b2-g20", adminName: "Ustadh Omar", duties: ["daily_task"], assignedBookId: "book-2" },
];

const t = (
  bookId: string,
  paceTier: number,
  stepNumber: number,
  partial: Partial<BankTask> = {},
): BankTask => ({
  bookId,
  paceTier,
  stepNumber,
  createdByBatch: "Batch 1",
  publishedDay: stepNumber,
  title: "Daily Reading Task",
  enStart: (stepNumber - 1) * paceTier + 1,
  enEnd: stepNumber * paceTier,
  amStart: (stepNumber - 1) * paceTier + 1,
  amEnd: stepNumber * paceTier,
  highlights: ["Sincerity of intention before action", "Guarding the tongue in gatherings", "Small consistent deeds outweigh bursts"],
  reflection: "Which of today's passages challenged a habit you currently hold?",
  deadline: "Submit reflection by 9:00 PM EAT",
  adminNote: "",
  ...partial,
});

export const TASK_BANK: BankTask[] = [
  t("book-1", 10, 1, { title: "Opening the Door of Tazkiyah" }),
  t("book-1", 10, 2, { title: "The Heart and Its States" }),
  t("book-1", 10, 3, { title: "Diseases of the Heart" }),
  t("book-1", 10, 4, { title: "The Cure: Remembrance" }),
  t("book-1", 5, 8, { title: "Patience in Private" }),
  t("book-2", 20, 1, { title: "A Letter on Beginnings" }),
  t("book-3", 10, 6, { title: "The Chapter of Sincerity" }),
];

export const bankKey = (bookId: string, tier: number, step: number) =>
  `${bookId}::${tier}::${step}`;

export const findBankTask = (bookId: string, tier: number, step: number) =>
  TASK_BANK.find((x) => x.bookId === bookId && x.paceTier === tier && x.stepNumber === step);

export const REVISIONS: RevisionProposal[] = [
  {
    id: "rev-1",
    bookId: "book-1",
    paceTier: 10,
    stepNumber: 2,
    proposedBy: "Sr. Maryam",
    batchName: "Batch 2",
    status: "pending",
    proposed: {
      title: "The Heart and Its States — Revised",
      enStart: 11,
      enEnd: 20,
      amStart: 11,
      amEnd: 20,
      highlights: [
        "Sincerity of intention before action",
        "The heart turns between hope and fear",
        "Small consistent deeds outweigh bursts",
      ],
      reflection: "How do you notice your heart turning between hope and fear during the day?",
      deadline: "Submit reflection by 9:00 PM EAT",
      adminNote: "Added a second highlight our group found essential.",
    },
  },
];

export const ROLES: RoleDef[] = [
  { id: "super_admin", label: "Super Admin", description: "Global catalog & task bank review" },
  { id: "batch_admin_1", label: "Batch Admin — Batch 1", description: "Calendar, roster & roadmap", batchId: "batch-1" },
  { id: "batch_admin_2", label: "Batch Admin — Batch 2", description: "Calendar, roster & roadmap", batchId: "batch-2" },
  { id: "pace_pioneer", label: "Pace Admin — Pioneer (B1, 10pg)", description: "Authors tasks from scratch", batchId: "batch-1", groupId: "b1-g10" },
  { id: "pace_follower", label: "Pace Admin — Follower (B2, 10pg)", description: "Inherits bank tasks", batchId: "batch-2", groupId: "b2-g10" },
  { id: "pace_restricted", label: "Pace Admin — No Daily Task Duty", description: "Read-only task card", batchId: "batch-2", groupId: "b2-g10" },
  { id: "member", label: "General Member", description: "Read-only roadmap & tasks" },
];

export const DUTY_LABELS: Record<string, string> = {
  daily_task: "Daily Task",
  reflection: "Reflection",
  inspiration: "Inspiration",
  attendance: "Attendance",
};

export const bookById = (id: string) => BOOKS.find((b) => b.id === id);
export const batchById = (id: string) => BATCHES.find((b) => b.id === id);
export const groupById = (id: string) => PACE_GROUPS.find((g) => g.id === id);
export const groupsForBatch = (batchId: string) => PACE_GROUPS.filter((g) => g.batchId === batchId);
export const assignmentsFor = (batchId: string, groupId: string) =>
  ASSIGNMENTS.filter((a) => a.batchId === batchId && a.groupId === groupId);
