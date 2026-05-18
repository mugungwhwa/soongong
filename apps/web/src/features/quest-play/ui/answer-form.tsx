"use client";
import { Button } from "@/shared/ui/button";

export function AnswerForm({
  answer,
  setAnswer,
  onSubmit,
  disabled,
}: {
  answer: string;
  setAnswer: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="정답 입력 (mock 정답은 '5')"
        className="flex-1 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-default)]"
        disabled={disabled}
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || !answer}
        className="bg-[var(--color-mint-500)] text-white hover:bg-[var(--color-mint-700)]"
      >
        제출
      </Button>
    </div>
  );
}
