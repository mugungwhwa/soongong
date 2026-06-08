import { PlayPage } from "@/views/play";

export default async function Page({ params }: { params: Promise<{ questId: string }> }) {
  const { questId } = await params;
  return <PlayPage questId={questId} />;
}
