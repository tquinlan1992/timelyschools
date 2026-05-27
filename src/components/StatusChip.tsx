import { FLAG_LABELS } from "@/constants";
import type { StudentFlag } from "@/types";

export function StatusChip({ flag }: { flag: StudentFlag }) {
  return <span className={`status-chip ${flag}`}>{FLAG_LABELS[flag]}</span>;
}
