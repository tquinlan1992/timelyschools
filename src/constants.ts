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

export const STUDENT_BANNERS: Record<
  string,
  { title: string; body: string; variant?: "info" | "warning" }
> = {
  S002: {
    title: "English Language Learner",
    body: "Ensure ENG102 (ELL Support) is requested alongside core English coursework.",
    variant: "info",
  },
  S003: {
    title: "Math retake required",
    body: "Student failed Algebra I last year. MTH101 must be completed before advancing in math.",
    variant: "warning",
  },
  S009: {
    title: "Heavy AP schedule",
    body: "Review for potential schedule conflicts when the master schedule is built.",
    variant: "info",
  },
  S010: {
    title: "Credit evaluation pending",
    body: "Transcript review in progress. Treat requests as draft until prior coursework is verified.",
    variant: "warning",
  },
};
