// SOO-40 DoD: 파이프라인을 통해 V1 변형 문제가 퀘스트로 출제되는 E2E 검증.
// in-memory fake Supabase 로 runIntakePipeline / stageGenerate 를 실제 흐름대로 구동.
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parseRecurrenceDNA,
  solveRecurrence,
} from "../variation-v1";

// ── createServiceClient 를 테스트마다 교체 ──────────────────────────────────
const mockCreateServiceClient = vi.fn();
vi.mock("@/shared/lib/supabase/service", () => ({
  createServiceClient: () => mockCreateServiceClient(),
}));

import { runIntakePipeline, stageGenerate } from "../pipeline";

// ── 인메모리 fake DB (테이블별 store + 자동 PK) ─────────────────────────────
type Row = Record<string, unknown>;
const PK: Record<string, string> = {
  external_sources: "source_id",
  subject_routing_results: "routing_id",
  parsed_learning_objects: "object_id",
  review_quests: "quest_id",
};

function makeFakeDb() {
  const store: Record<string, Row[]> = {
    external_sources: [],
    subject_routing_results: [],
    parsed_learning_objects: [],
    type_pattern_cards: [],
    review_quests: [],
  };
  let counter = 0;

  function from(table: string) {
    const filters: Row = {};
    let insertedRow: Row | null = null;
    const api = {
      select: () => api,
      eq: (col: string, val: unknown) => {
        filters[col] = val;
        return api;
      },
      limit: () => api,
      insert: (payload: Row) => {
        counter += 1;
        const pk = PK[table];
        insertedRow = pk ? { ...payload, [pk]: `${table}-${counter}` } : { ...payload };
        store[table].push(insertedRow);
        return api;
      },
      single: async () => {
        if (insertedRow) return { data: insertedRow, error: null };
        const row = store[table].find((r) =>
          Object.entries(filters).every(([k, v]) => r[k] === v),
        );
        return { data: row ?? null, error: null };
      },
      maybeSingle: async () => {
        if (insertedRow) return { data: insertedRow, error: null };
        const row = store[table].find((r) =>
          Object.entries(filters).every(([k, v]) => r[k] === v),
        );
        return { data: row ?? null, error: null };
      },
    };
    return api;
  }

  return { client: { from }, store };
}

beforeEach(() => {
  mockCreateServiceClient.mockReset();
});

describe("runIntakePipeline — 점화식 입력 → V1 변형 퀘스트 출제 (E2E)", () => {
  const RECURRENCE_TEXT = "$a_1 = 2$, $a_{n+1} = 3a_n + 1$ 일 때 $a_3$를 구하시오.";

  it("점화식 문제를 올리면 변형 문제가 V1 퀘스트로 출제된다 [DoD]", async () => {
    const { client, store } = makeFakeDb();
    mockCreateServiceClient.mockReturnValue(client);

    const out = await runIntakePipeline({
      userId: "user-1",
      rawText: RECURRENCE_TEXT,
      sourceType: "manual_text",
    });

    // 퀘스트가 1건 출제됐고 V1 변형이다.
    expect(store.review_quests).toHaveLength(1);
    const quest = store.review_quests[0];
    expect(quest.variation_level).toBe("V1");
    expect(quest.quest_format).toBe("number_variation");
    expect(quest.quest_mode).toBe("today");
    expect(quest.quest_id).toBe(out.questId);

    // PLO 는 2건: 원본(인식 단계) + 변형(생성 단계).
    expect(store.parsed_learning_objects).toHaveLength(2);
    const original = store.parsed_learning_objects[0];
    const variant = store.parsed_learning_objects[1];

    // 퀘스트는 원본이 아니라 '변형 객체' 를 가리킨다.
    expect(quest.object_id).toBe(variant.object_id);
    expect(quest.object_id).not.toBe(original.object_id);

    // 변형 지문은 원문과 다르고, 점화식으로 다시 파싱·풀이가 가능하다(풀이 보존).
    const variantText = variant.extracted_text as string;
    expect(variantText).not.toBe(RECURRENCE_TEXT);
    const variantDna = parseRecurrenceDNA(variantText);
    expect(variantDna).not.toBeNull();
    expect(variantDna!.recurrence.form).toBe("linear"); // 원본과 같은 풀이전략
    // 변형 지문을 원 풀이법으로 풀면 유한한 정답이 나온다.
    const answer = solveRecurrence(
      variantDna!.recurrence,
      variantDna!.initial,
      variantDna!.targetIndex,
    );
    expect(Number.isFinite(answer)).toBe(true);

    // 생성 문항은 검수 큐(pending) 경유.
    expect(variant.reviewer_status).toBe("pending");
  });
});

describe("stageGenerate — graceful fallback", () => {
  it("점화식이 아닌 객체는 V0 원문 회독으로 폴백한다", async () => {
    const { client, store } = makeFakeDb();
    // 원본 객체를 미리 심어둔다(점화식 아님).
    store.parsed_learning_objects.push({
      object_id: "obj-original",
      extracted_text: "다음 글의 주제로 가장 적절한 것은?",
      subject: "국어",
    });
    mockCreateServiceClient.mockReturnValue(client);

    const out = await stageGenerate({
      userId: "user-1",
      objectId: "obj-original",
      subject: "국어",
      typeId: null,
      typeName: "general",
    });

    // 변형 객체는 새로 만들어지지 않고(여전히 1건), 퀘스트는 V0/원문이며 원본을 가리킨다.
    expect(store.parsed_learning_objects).toHaveLength(1);
    expect(store.review_quests).toHaveLength(1);
    const quest = store.review_quests[0];
    expect(quest.variation_level).toBe("V0");
    expect(quest.quest_format).toBe("original");
    expect(quest.object_id).toBe("obj-original");
    expect(quest.quest_id).toBe(out.questId);
  });

  it("점화식 객체는 변형 객체를 새로 만들어 V1 퀘스트로 출제한다", async () => {
    const { client, store } = makeFakeDb();
    store.parsed_learning_objects.push({
      object_id: "obj-original",
      extracted_text: "$a_1=1$, $a_{n+1}=a_n+2n$ 일 때 $a_4$의 값은?",
      subject: "수학",
    });
    mockCreateServiceClient.mockReturnValue(client);

    await stageGenerate({
      userId: "user-1",
      objectId: "obj-original",
      subject: "수학",
      typeId: null,
      typeName: "general",
    });

    expect(store.parsed_learning_objects).toHaveLength(2); // 원본 + 변형
    const quest = store.review_quests[0];
    expect(quest.variation_level).toBe("V1");
    expect(quest.object_id).toBe(store.parsed_learning_objects[1].object_id);
  });
});
