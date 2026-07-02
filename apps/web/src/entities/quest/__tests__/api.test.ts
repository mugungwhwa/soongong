// DoD: 날짜 경계(KST 자정)·overdue 포함·status 필터 — SOO-164
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Supabase chainable mock — vi.hoisted로 vi.mock factory보다 먼저 생성
const mockBuilder = vi.hoisted(() => {
  const builder: Record<string, unknown> = {};
  const chainMethods = ["select", "eq", "lte", "in", "order"];
  chainMethods.forEach((m) => {
    builder[m] = vi.fn().mockReturnValue(builder);
  });
  // Supabase query builder는 Promise-like이므로 then/catch 추가
  builder.then = (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
    Promise.resolve({ data: [], error: null }).then(resolve as (v: unknown) => unknown);
  builder.catch = () => Promise.resolve({ data: [], error: null });
  return builder;
});

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({ from: () => mockBuilder }),
}));

import { getKstTodayStr, getTodayQuestsEnriched } from "../api";

// ────────────────────────────────────────────────────────────
// KST 날짜 경계 테스트
// ────────────────────────────────────────────────────────────
describe("getKstTodayStr — KST 자정 경계", () => {
  afterEach(() => vi.useRealTimers());

  it("UTC 14:59 (KST 23:59) → 당일 날짜", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T14:59:00Z"));
    expect(getKstTodayStr()).toBe("2026-07-02");
  });

  it("UTC 15:00 (KST 00:00 다음날) → 다음날 날짜", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T15:00:00Z"));
    expect(getKstTodayStr()).toBe("2026-07-03");
  });

  it("UTC 22:00 (KST 07:00 다음날) — 구버그(UTC slice)와 결과가 다름", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T22:00:00Z"));
    const kst = getKstTodayStr();
    const utcSlice = new Date("2026-07-02T22:00:00Z").toISOString().slice(0, 10);
    expect(kst).toBe("2026-07-03");    // KST 기준 다음날
    expect(utcSlice).toBe("2026-07-02"); // 구버그는 이 값 → 알럿↔목록 불일치
    expect(kst).not.toBe(utcSlice);
  });

  it("UTC 23:59 (KST 08:59 다음날) → KST 기준 다음날", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T23:59:00Z"));
    expect(getKstTodayStr()).toBe("2026-07-03");
  });
});

// ────────────────────────────────────────────────────────────
// 쿼리 조건 테스트 (overdue 포함 · status 필터 · KST 기준)
// ────────────────────────────────────────────────────────────
describe("getTodayQuestsEnriched — 쿼리 조건", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // UTC 10:00 → KST 19:00, 같은 날 "2026-07-02"
    vi.setSystemTime(new Date("2026-07-02T10:00:00Z"));
    vi.clearAllMocks();
    // clearAllMocks 후 체인 반환값 재설정
    (["select", "eq", "lte", "in", "order"] as const).forEach((m) => {
      (mockBuilder[m] as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder);
    });
  });
  afterEach(() => vi.useRealTimers());

  it("due_date 조건이 lte (overdue 포함) — eq('due_date') 아님", async () => {
    await getTodayQuestsEnriched("user-1");
    expect(mockBuilder.lte).toHaveBeenCalledWith("due_date", "2026-07-02");
    // 구버그: eq("due_date", ...) 로 당일만 조회했음 → 이제 없어야 함
    const eqCalls = (mockBuilder.eq as ReturnType<typeof vi.fn>).mock.calls;
    const dueDateEq = eqCalls.filter((args: unknown[]) => args[0] === "due_date");
    expect(dueDateEq).toHaveLength(0);
  });

  it("status = pending 필터 — 완료 회독 제외", async () => {
    await getTodayQuestsEnriched("user-1");
    expect(mockBuilder.eq).toHaveBeenCalledWith("status", "pending");
  });

  it("quest_mode in [today, memory_defense] — 알럿(useNudgeTrigger)과 동일 범위", async () => {
    await getTodayQuestsEnriched("user-1");
    expect(mockBuilder.in).toHaveBeenCalledWith("quest_mode", ["today", "memory_defense"]);
  });

  it("KST 기준 날짜 사용 — UTC 22:00 시각에도 다음날로 전환", async () => {
    vi.setSystemTime(new Date("2026-07-02T22:00:00Z")); // KST 2026-07-03 07:00
    await getTodayQuestsEnriched("user-1");
    expect(mockBuilder.lte).toHaveBeenCalledWith("due_date", "2026-07-03");
  });
});
