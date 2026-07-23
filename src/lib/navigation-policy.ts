import type { Role } from "@/lib/permissions";

export type PageId =
  | "dashboard"
  | "tribes"
  | "voters"
  | "electoral-keys"
  | "services"
  | "tasks"
  | "volunteers"
  | "public-opinion"
  | "competitors"
  | "data-analysis"
  | "early-warnings"
  | "advanced-indicators"
  | "fieldagent"
  | "comms"
  | "warroom"
  | "commission"
  | "election-results"
  | "sms";

const ALL_PAGES: readonly PageId[] = [
  "dashboard",
  "tribes",
  "voters",
  "electoral-keys",
  "services",
  "tasks",
  "volunteers",
  "public-opinion",
  "competitors",
  "data-analysis",
  "early-warnings",
  "advanced-indicators",
  "fieldagent",
  "comms",
  "warroom",
  "commission",
  "election-results",
  "sms",
];

const ROLE_PAGE_ACCESS: Record<Role, ReadonlySet<PageId>> = {
  ADMIN: new Set(ALL_PAGES),
  KEY_USER: new Set([
    "dashboard",
    "tribes",
    "voters",
    "electoral-keys",
    "services",
    "tasks",
    "public-opinion",
    "competitors",
    "data-analysis",
    "early-warnings",
    "fieldagent",
    "comms",
    "warroom",
    "commission",
    "election-results",
  ]),
  OBSERVER: new Set([
    "dashboard",
    "public-opinion",
    "data-analysis",
    "early-warnings",
    "advanced-indicators",
    "commission",
    "election-results",
  ]),
};

export function isPageAllowed(role: string | undefined, page: PageId): boolean {
  if (role !== "ADMIN" && role !== "KEY_USER" && role !== "OBSERVER") {
    return false;
  }

  return ROLE_PAGE_ACCESS[role].has(page);
}

