import { PlayPage } from "@/views/play/ui/play-page";

export default async function Page({ params }: { params: Promise<{ questId: string }> }) {
  const { questId } = await params;
  return <PlayPage questId={questId} />;
}
