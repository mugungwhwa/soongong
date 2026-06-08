export type UserRole = "student" | "parent" | "admin" | "reviewer";

export type User = {
  id: string;
  role: UserRole;
  birth_year: number | null;
  is_under_14: boolean;
  guardian_verified: boolean;
  created_at: string;
  deleted_at: string | null;
};
