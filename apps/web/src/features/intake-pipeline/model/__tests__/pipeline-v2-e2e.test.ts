// SOO-44 DoD: 파이프라인을 통해 V2(요구값 변경) 변형 문제가 퀘스트로 출제되는 E2E 검증.
// in-memory fake Supabase 로 runIntakePipeline / stageGenerate 를 실제 흐름대로 구동.
// V1 회귀 방지: variationLevel 미지정(기본) 시 V1 동작이 그대로인지도 함께 확인.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateV2Variation, type V2Requirement } from "../variation-v2";
import {
  parseRecurrenceDNA,
  solveRecurrence,
} from "../variation-v1";

const mockCreateServiceClient = vi.fn();
vi.mock("@/shared/lib/supabase/service", () => ({
  createServiceClient: () => mockCreateServiceClient(),
}));

import { runIntakePipeline, stageGenerate } from "../pipeline";

type Row = Record<string, unknown>;
const PK: Record<string, string> = {
  external_sources: "source_id",
  subject_routing_results: "routing_id",
  parsed_learning_objects: "object_id",
  review_quests: "quest_id",
  student_memory_items: "memory_id",
};

function makeFakeDb() {
  const store: Record<string, Row[]> = {
    external_sources: [],
    subject_routing_results: [],
    parsed_learning_objects: [],
    type_pattern_cards: [],
    review_quests: [],
    student_memory_items: [],
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
      // stageMemorize 의 upsert(...).select().single() 모사.
      // onConflict/ignoreDuplicates: 동일 (user_id, concept_key) 행이 있으면 기존 행 반환,
      // 없으면 새 행 삽입 — 실제 Supabase upsert 시맨틱과 정합.
      upsert: (payload: Row, _opts?: unknown) => {
        const existing = store[table].find(
          (r) =>
            payload.user_id !== undefined &&
            r.user_id === payload.user_id &&
            r.concept_key === payload.concept_key,
        );
        if (existing) {
          insertedRow = existing;
          return api;
        }
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

const RECURRENCE_TEXT = "$a_1 = 2$, $a_{n+1} = 3a_n + 1$ 일 때 $a_3$를 구하시오.";

describe("runIntakePipeline — 점화식 입력 → V2 요구값 변형 퀘스트 출제 (E2E)", () => {
  it("variationLevel='V2' 이면 V2 요구값 변형이 퀘스트로 출제된다 [DoD]", async () => {
    const { client, store } = makeFakeDb();
    mockCreateServiceClient.mockReturnValue(client);

    const out = await runIntakePipeline({
      userId: "user-1",
      rawText: RECURRENCE_TEXT,
      sourceType: "manual_text",
      variationLevel: "V2",
    });

    // 퀘스트 1건 — V2 / target_change.
    expect(store.review_quests).toHaveLength(1);
    const quest = store.review_quests[0];
    expect(quest.variation_level).toBe("V2");
    expect(quest.quest_format).toBe("target_change");
    expect(quest.difficulty_level).toBe("L3");
    expect(quest.quest_mode).toBe("today");
    expect(quest.quest_id).toBe(out.questId);

    // PLO 2건: 원본(인식) + 변형(생성). 퀘스트는 변형 객체를 가리킨다.
    expect(store.parsed_learning_objects).toHaveLength(2);
    const original = store.parsed_learning_objects[0];
    const variant = store.parsed_learning_objects[1];
    expect(quest.object_id).toBe(variant.object_id);
    expect(quest.object_id).not.toBe(original.object_id);

    // 변형 지문은 원문과 다르고, 요구값이 두 항(차/합/비교)으로 바뀌었다.
    const variantText = variant.extracted_text as string;
    expect(variantText).not.toBe(RECURRENCE_TEXT);
    // 점화식 조건부는 원본 보존 → 다시 파싱 가능(풀이 정합 토대).
    const setupDna = parseRecurrenceDNA(variantText);
    expect(setupDna).not.toBeNull();
    expect(setupDna!.recurrence).toEqual(parseRecurrenceDNA(RECURRENCE_TEXT)!.recurrence);
    // 지문이 단일 항이 아니라 두 항 요구값을 담는다("중 더 큰" / "-" / "+").
    expect(variantText).toMatch(/중 더 큰 값|a_\{\d+\} [-+] a_\{\d+\}/);

    // 생성 문항은 검수 큐(pending) 경유.
    expect(variant.reviewer_status).toBe("pending");
  });

  it("기본(variationLevel 미지정)은 여전히 V1 — V2 추가가 V1 경로를 바꾸지 않는다 [회귀 가드]", async () => {
    const { client, store } = makeFakeDb();
    mockCreateServiceClient.mockReturnValue(client);

    await runIntakePipeline({
      userId: "user-1",
      rawText: RECURRENCE_TEXT,
      sourceType: "manual_text",
    });

    expect(store.review_quests).toHaveLength(1);
    expect(store.review_quests[0].variation_level).toBe("V1");
    expect(store.review_quests[0].quest_format).toBe("number_variation");
  });
});

describe("stageGenerate — V2 경로", () => {
  it("점화식 객체 + V2 레벨이면 요구값 변형 객체를 새로 만들어 V2 퀘스트로 출제한다", async () => {
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
      variationLevel: "V2",
    });

    expect(store.parsed_learning_objects).toHaveLength(2); // 원본 + 변형
    const quest = store.review_quests[0];
    expect(quest.variation_level).toBe("V2");
    expect(quest.quest_format).toBe("target_change");
    expect(quest.object_id).toBe(store.parsed_learning_objects[1].object_id);
  });

  it("점화식이 아니면 V2 레벨이어도 V0 원문 회독으로 폴백한다", async () => {
    const { client, store } = makeFakeDb();
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
      variationLevel: "V2",
    });

    expect(store.parsed_learning_objects).toHaveLength(1); // 변형 객체 미생성
    expect(store.review_quests).toHaveLength(1);
    const quest = store.review_quests[0];
    expect(quest.variation_level).toBe("V0");
    expect(quest.quest_format).toBe("original");
    expect(quest.object_id).toBe("obj-original");
    expect(quest.quest_id).toBe(out.questId);
  });

  it("출제된 V2 지문의 정답이 원 풀이법으로 재현된다(풀이 정합 E2E)", async () => {
    // 생성과 동일 입력으로 엔진을 직접 호출해 정답·요구값을 얻고,
    // 그 요구값을 원 점화식에 solveRecurrence 로 다시 풀어 일치를 확인한다.
    const text = "$a_1=1$, $a_{n+1}=a_n+2n$ 일 때 $a_4$의 값은?";
    const v2 = generateV2Variation(text)!;
    const src = parseRecurrenceDNA(text)!;
    const req: V2Requirement = v2.requirement;
    const aLo = solveRecurrence(src.recurrence, src.initial, req.lo);
    const aHi = solveRecurrence(src.recurrence, src.initial, req.hi);
    const recomputed =
      req.form === "difference" ? aHi - aLo
      : req.form === "sum" ? aLo + aHi
      : Math.max(aLo, aHi);
    expect(recomputed).toBe(v2.answer);
  });
});
