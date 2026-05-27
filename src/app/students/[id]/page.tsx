import { AppShell } from "@/components/AppShell";
import { StudentWorkspace } from "@/components/StudentWorkspace";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell selectedStudentId={id}>
      <StudentWorkspace studentId={id} />
    </AppShell>
  );
}
