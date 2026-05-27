import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="workspace-empty">
        <h2>Select a student</h2>
        <p>
          Choose a student from the roster to review and edit their course requests for
          2026–27. Students who need attention appear first.
        </p>
      </div>
    </AppShell>
  );
}
