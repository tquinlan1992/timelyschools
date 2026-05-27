import type { StudentFlag } from "@/types";

export const SCHOOL_YEAR = "2026-2027";

export const FLAG_LABELS: Record<StudentFlag, string> = {
  ell: "ELL",
  retake: "Retake",
  transfer: "Transfer",
  ap_heavy: "AP load",
  no_requests: "No requests",
  credit_pending: "Credit review",
};

export const FLAG_BANNERS: Partial<
  Record<StudentFlag, { title: string; body: string; variant?: "info" | "warning" }>
> = {
  ell: {
    title: "English Language Learner",
    body: "Ensure ENG102 (ELL Support) is requested alongside core English coursework.",
    variant: "info",
  },
  retake: {
    title: "Math retake required",
    body: "Student failed Algebra I last year. MTH101 must be completed before advancing in math.",
    variant: "warning",
  },
  ap_heavy: {
    title: "Heavy AP schedule",
    body: "Review for potential schedule conflicts when the master schedule is built.",
    variant: "info",
  },
  transfer: {
    title: "Mid-year transfer",
    body: "Student transferred from another district. Verify prior coursework before finalizing requests.",
    variant: "warning",
  },
  credit_pending: {
    title: "Credit evaluation pending",
    body: "Transcript review in progress. Treat requests as draft until prior coursework is verified.",
    variant: "warning",
  },
  no_requests: {
    title: "No course requests yet",
    body: "Add priority and elective courses from the catalog before this list is ready for scheduling.",
    variant: "warning",
  },
};

/** Appendix B edge-case students — one seeded example per scenario. */
export const EDGE_CASE_STUDENTS = {
  ell: "S002",
  retake: "S003",
  apHeavy: "S009",
  transfer: "S010",
} as const;
