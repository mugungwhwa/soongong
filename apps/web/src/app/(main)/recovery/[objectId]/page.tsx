import { RecoveryPage } from "@/views/recovery";

export default async function Page({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId } = await params;
  return <RecoveryPage objectId={objectId} />;
}
