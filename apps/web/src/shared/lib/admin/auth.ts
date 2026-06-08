import { createClient } from "@/shared/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  const { data: row } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!row || !["admin", "reviewer"].includes(row.role as string))
    throw new Error("forbidden");
  return { user, role: row.role as "admin" | "reviewer" };
}
