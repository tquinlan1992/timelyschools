import { StudentWorkspace } from "@/components/StudentWorkspace";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentWorkspace studentId={id} />;
}
