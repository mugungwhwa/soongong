"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { ChevronLeft, Loader2 } from "lucide-react";
import { createSource, runIntakePipeline } from "@/entities/source";

const CHAR_LIMIT = 2000;

export function ManualTextForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const source = await createSource({
        source_type: "manual_text",
        raw_text: trimmed,
        storage_policy: "temporary",
      });
      if (!source) throw new Error("저장 실패");

      await runIntakePipeline(source.source_id);
      router.push(`/analysis/${source.source_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft size={16} /> 뒤로
      </button>

      <div>
        <Label htmlFor="manual-text">문제 또는 개념을 입력하세요</Label>
        <Textarea
          id="manual-text"
          placeholder="예) lim(n→∞) (3n²+2n-1)/(n²+5) 의 극한값을 구하시오."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, CHAR_LIMIT))}
          rows={8}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {text.length}/{CHAR_LIMIT}
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        className="w-full"
        disabled={!text.trim() || loading}
        onClick={handleSubmit}
      >
        {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
        회독퀘스트로 전환
      </Button>
    </div>
  );
}
