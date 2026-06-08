import { redirect } from "next/navigation";
import { AdminPage } from "@/views/admin/ui/admin-page";
import { requireAdmin } from "@/shared/lib/admin/auth";

export default async function Page() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  return <AdminPage />;
}
