import { TodayPage } from "@/views/today";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ first?: string }>;
}) {
  const params = await searchParams;
  return <TodayPage isFirstEntry={params.first === "1"} />;
}
