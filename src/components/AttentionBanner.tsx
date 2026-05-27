import { STUDENT_BANNERS } from "@/constants";

export function AttentionBanner({ studentId }: { studentId: string }) {
  const banner = STUDENT_BANNERS[studentId];
  if (!banner) return null;

  return (
    <div className={`attention-banner ${banner.variant ?? "info"}`}>
      <h3>{banner.title}</h3>
      <p>{banner.body}</p>
    </div>
  );
}
