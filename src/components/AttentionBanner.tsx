import { FLAG_BANNERS } from "@/constants";
import type { StudentFlag } from "@/types";

const BANNER_ORDER: StudentFlag[] = [
  "no_requests",
  "credit_pending",
  "transfer",
  "retake",
  "ell",
  "ap_heavy",
];

export function AttentionBanner({ flags }: { flags: StudentFlag[] }) {
  const ordered = BANNER_ORDER.filter((flag) => flags.includes(flag) && FLAG_BANNERS[flag]);

  if (ordered.length === 0) return null;

  return (
    <div className="attention-banners">
      {ordered.map((flag) => {
        const banner = FLAG_BANNERS[flag]!;
        return (
          <div key={flag} className={`attention-banner ${banner.variant ?? "info"}`}>
            <h3>{banner.title}</h3>
            <p>{banner.body}</p>
          </div>
        );
      })}
    </div>
  );
}
