"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ChevronLeft, Loader2 } from "lucide-react";
import { createSource, runIntakePipeline } from "@/entities/source";

export function LectureLogForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const source = await createSource({
        source_type: "lecture_log",
        raw_text: `강의: ${title}\n단원: ${unit}`,
        storage_policy: "temporary",
        metadata: { lecture_title: title, unit },
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

      <div className="space-y-3">
        <div>
          <Label htmlFor="lec-title">강의 이름</Label>
          <Input
            id="lec-title"
            placeholder="예) 수능 수학 미적분 4강"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lec-unit">단원 (선택)</Label>
          <Input
            id="lec-unit"
            placeholder="예) 수열의 극한"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        className="w-full"
        disabled={!title.trim() || loading}
        onClick={handleSubmit}
      >
        {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
        회독퀘스트로 전환
      </Button>
    </div>
  );
}
