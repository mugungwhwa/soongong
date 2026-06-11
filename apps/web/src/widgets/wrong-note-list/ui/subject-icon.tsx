import {
  Sigma,
  Languages,
  BookOpen,
  FlaskConical,
  Globe2,
  PencilLine,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const SUBJECT_ICON: Record<string, ComponentType<LucideProps>> = {
  수학: Sigma,
  영어: Languages,
  국어: BookOpen,
  과학: FlaskConical,
  사회: Globe2,
};

/** 과목명 → Lucide 아이콘 (이모지 미사용 — design-system Lucide 일원화). */
export function SubjectIcon({
  subject,
  size = 18,
  color = "var(--color-mint-700)",
}: {
  subject: string;
  size?: number;
  color?: string;
}) {
  const Icon = SUBJECT_ICON[subject] ?? PencilLine;
  return (
    <Icon
      size={size}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      color={color}
      aria-hidden="true"
    />
  );
}
