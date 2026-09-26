export type Duty = "daily_task" | "reflection" | "inspiration" | "attendance";

export interface Book {
  id: string;
  slot: number;
  title: string;
  author: string;
  pagesEN: number;
  pagesAM: number;
}

export interface PaceOffset {
  id: string;
  title: string;
  startDate: string;
  days: number;
}

export interface Batch {
  id: string;
  name: string;
  status: "active" | "upcoming" | "archived";
  startDate: string;
  readingDays: string[]; // e.g. ["Mon","Tue","Wed","Thu","Fri"]
  offsets: PaceOffset[];
}

export interface PaceGroup {
  id: string;
  batchId: string;
  tier: number; // pages per day
  currentBookId: string;
  currentStep: number; // content step within the book
  memberCount: number;
}

export interface PaceAdminAssignment {
  id: string;
  batchId: string;
  groupId: string;
  adminName: string;
  duties: Duty[];
  assignedBookId: string | null; // book lock
}

export interface TaskContent {
  title: string;
  enStart: number;
  enEnd: number;
  amStart: number;
  amEnd: number;
  highlights: string[];
  reflection: string;
  deadline: string;
  adminNote: string;
}

export interface BankTask extends TaskContent {
  bookId: string;
  paceTier: number;
  stepNumber: number;
  createdByBatch: string;
  publishedDay: number;
}

export interface RevisionProposal {
  id: string;
  bookId: string;
  paceTier: number;
  stepNumber: number;
  proposedBy: string;
  batchName: string;
  status: "pending" | "accepted" | "local" | "rejected";
  proposed: TaskContent;
}

export type RoleId =
  | "super_admin"
  | "batch_admin_1"
  | "batch_admin_2"
  | "pace_pioneer"
  | "pace_follower"
  | "pace_restricted"
  | "member";

export interface RoleDef {
  id: RoleId;
  label: string;
  description: string;
  batchId?: string;
  groupId?: string;
}
