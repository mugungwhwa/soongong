import { AdminGeneratedPage } from "@/views/admin-generated";
import {
  MOCK_GENERATED_PROBLEMS,
  type GeneratedProblemReviewItem,
} from "@/entities/generated-problem";

export const dynamic = "force-dynamic";

async function loadItems(): Promise<{
  items: GeneratedProblemReviewItem[];
  usingMock: boolean;
}> {
  return { items: MOCK_GENERATED_PROBLEMS, usingMock: true };
}

export default async function Page() {
  const { items, usingMock } = await loadItems();
  return <AdminGeneratedPage items={items} usingMock={usingMock} />;
}
