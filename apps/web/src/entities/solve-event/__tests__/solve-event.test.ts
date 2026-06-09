// P6 DoD: solve-event 영속화 계약 — graceful-degrade(비로그인 no-op) + 정상 기록.
import { describe, it, expect, vi, beforeEach } from "vitest";

// createClient 를 테스트마다 교체할 수 있도록 mock 함수로 노출
const mockCreateClient = vi.fn();
vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => mockCreateClient(),
}));

import { recordSolveEvent, uploadSolution } from "../api";

type User = { id: string } | null;

function fakeClient(opts: {
  user: User;
  insertResult?: { data: unknown; error: unknown };
  uploadError?: unknown;
}) {
  return {
    auth: {
      getUser: async () => ({ data: { user: opts.user } }),
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: async () =>
            opts.insertResult ?? { data: null, error: null },
        }),
      }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ error: opts.uploadError ?? null }),
      }),
    },
  };
}

beforeEach(() => {
  mockCreateClient.mockReset();
});

describe("recordSolveEvent — graceful degrade", () => {
  it("비로그인 시 null 반환 (데모 흐름 보존, no-op)", async () => {
    mockCreateClient.mockReturnValue(fakeClient({ user: null }));
    const result = await recordSolveEvent({
      quest_id: "q-1",
      is_correct: true,
      solve_time_seconds: 12,
    });
    expect(result).toBeNull();
  });

  it("로그인 시 삽입된 행 반환", async () => {
    const row = { event_id: "e-1", quest_id: "q-1", is_correct: true };
    mockCreateClient.mockReturnValue(
      fakeClient({
        user: { id: "u-1" },
        insertResult: { data: row, error: null },
      }),
    );
    const result = await recordSolveEvent({
      quest_id: "q-1",
      is_correct: true,
      solve_time_seconds: 12,
    });
    expect(result).toEqual(row);
  });

  it("DB 에러 시 null 반환 (throw 하지 않음)", async () => {
    mockCreateClient.mockReturnValue(
      fakeClient({
        user: { id: "u-1" },
        insertResult: { data: null, error: { message: "fk violation" } },
      }),
    );
    const result = await recordSolveEvent({
      quest_id: "missing-quest",
      is_correct: false,
      solve_time_seconds: 5,
    });
    expect(result).toBeNull();
  });
});

describe("uploadSolution — graceful degrade", () => {
  it("비로그인 시 빈 객체 반환", async () => {
    mockCreateClient.mockReturnValue(fakeClient({ user: null }));
    const result = await uploadSolution("q-1", { strokes: [] }, null);
    expect(result).toEqual({});
  });

  it("로그인 + 업로드 성공 시 stroke_url 반환", async () => {
    mockCreateClient.mockReturnValue(
      fakeClient({ user: { id: "u-1" } }),
    );
    const result = await uploadSolution("q-1", { strokes: [] }, null);
    expect(result.stroke_url).toBe("u-1/q-1.json");
    expect(result.solution_image_url).toBeUndefined();
  });

  it("업로드 에러 시 해당 경로 생략", async () => {
    mockCreateClient.mockReturnValue(
      fakeClient({ user: { id: "u-1" }, uploadError: { message: "quota" } }),
    );
    const result = await uploadSolution("q-1", { strokes: [] }, null);
    expect(result.stroke_url).toBeUndefined();
  });
});
