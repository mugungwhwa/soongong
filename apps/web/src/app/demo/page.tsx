import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Mascot, type MascotMood } from "@/shared/ui/mascot";

const MOODS: MascotMood[] = ["cheer", "celebrate", "think", "comfort", "sleep", "surprise"];

export default function DemoPage() {
  return (
    <main className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
        순공대장 컴포넌트 데모
      </h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
          Button
        </h2>
        <div className="flex gap-3">
          <Button>기본</Button>
          <Button variant="outline">아웃라인</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="secondary">세컨더리</Button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
          Card + Mascot + Badge
        </h2>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Mascot mood="cheer" size="lg" />
            <div>
              <div className="text-lg font-semibold">순공이 응원!</div>
              <Badge className="mt-2">민트 배지</Badge>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
          Mascot 6 mood
        </h2>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map((m) => (
            <div key={m} className="flex flex-col items-center gap-1">
              <Mascot mood={m} size="md" />
              <span className="text-xs text-[var(--color-text-muted)]">{m}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
