# 순공대장 MVP 1차 — P3 Curriculum RAG Sub-Plan

> **상위 계획:** [P3 AI Pipeline Sub-Plan](./2026-05-14-soongong-mvp1-p3-ai-pipeline.md)
> **에이전트 정의:** [문제 리서치 에이전트 v1.0](../../agent-strategy/2026-05-18-문제-리서치-에이전트-정의.md)
> **운영 계약:** [입력 스펙 v1.0](../../agent-strategy/2026-05-18-문제-리서치-에이전트-입력스펙.md)
> **For agentic workers:** `superpowers:subagent-driven-development` 권장. Postgres 마이그레이션은 `vercel:vercel-storage` skill 먼저 invoke.

**Goal:** 문제 리서치 에이전트의 `analysis.unit/topic` 출력을 신뢰 가능하게 채워줄 **Curriculum RAG** 1개를 MVP 1차에 박는다. 임베딩/벡터 DB 가지 않고 Postgres FTS + 단원 트리 JSON으로 충분.

**Why first:** Curriculum RAG 없이는 spec §4 출력의 `unit/topic`이 통째로 비어 있다. 라우팅(P3 Task 4)·분석(Task 6)·평가(Task 9) 모두 prerequisite.

**Scope (MVP 1차):**
- 수학만 (수학 1·2·미적·확통) ~200 단원
- 국어/영어/탐구는 MVP 2차

**Tech Stack:** Postgres FTS (Korean 분석기) + units/topics 테이블 + Edge Function 1개 (`curriculum-lookup`).

---

## File Structure

```
supabase/
  migrations/
    20260518_units_topics.sql        ← Task 2
  functions/
    curriculum-lookup/
      index.ts                        ← Task 3
data/
  curriculum/
    math.units.json                   ← Task 1
    math.topics.json                  ← Task 1
eval/
  curriculum-rag/
    golden-set.json                   ← Task 5 (KICE 30문제 라벨)
    runner.ts                         ← Task 5
```

---

## Task 1: T1 — 수학 단원 트리 JSON seed 작성

**출처:** 한국 교육과정평가원 공개 교육과정 문서 + KICE 기출 단원 분류
**목표:** 200 단원, 단원당 (id, code, name, parent_id, depth, exam_topic, sample_question)

### 산출물
- `data/curriculum/math.units.json` — 단원 트리 (top-level 4과목 → 중단원 → 소단원)
- `data/curriculum/math.topics.json` — 소단원별 핵심 개념·유형·대표 문제 1~3개

### 스키마 예시
```json
{
  "units": [
    {
      "id": "math-1-seq",
      "code": "수학1.수열",
      "name": "수열",
      "parent_id": "math-1",
      "depth": 2
    },
    {
      "id": "math-1-seq-recurrence",
      "code": "수학1.수열.점화식",
      "name": "점화식",
      "parent_id": "math-1-seq",
      "depth": 3
    }
  ],
  "topics": [
    {
      "id": "math-1-seq-recurrence-linear",
      "unit_id": "math-1-seq-recurrence",
      "name": "선형 점화식 a_{n+1} = pa_n + q",
      "description": "특성근/치환을 통해 일반항 도출",
      "sample_question": "a_1 = 1, a_{n+1} = 2a_n + 3일 때 a_5는?"
    }
  ]
}
```

### 검증
```bash
jq '.units | length' data/curriculum/math.units.json   # ≥ 200
jq '.topics | length' data/curriculum/math.topics.json # ≥ 200
```

---

## Task 2: T2 — units / topics 테이블 마이그레이션

### SQL
```sql
CREATE TABLE units (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  parent_id text REFERENCES units(id),
  depth integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE topics (
  id text PRIMARY KEY,
  unit_id text REFERENCES units(id) NOT NULL,
  name text NOT NULL,
  description text,
  sample_question text,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(sample_question, '')), 'C')
  ) STORED,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX topics_search_idx ON topics USING gin(search_vector);
CREATE INDEX topics_unit_idx ON topics(unit_id);
```

**RLS:** read는 모든 인증 사용자 OK. write는 service_role만.

### Seed 적용
```bash
psql $DATABASE_URL -c "\copy units FROM 'data/curriculum/math.units.json' WITH (FORMAT json)"
# 또는 ts-node 스크립트로 jq + INSERT batch
```

---

## Task 3: T3 — `curriculum-lookup` Edge Function

### Input
```json
{
  "raw_text": "수열 {a_n}이 a_1=1, a_{n+1}=2a_n+3 ...",
  "subject_hint": "math",
  "top_k": 3
}
```

### Output
```json
{
  "candidates": [
    {
      "unit_id": "math-1-seq-recurrence",
      "unit_name": "수열 > 점화식",
      "topic_id": "math-1-seq-recurrence-linear",
      "topic_name": "선형 점화식 a_{n+1} = pa_n + q",
      "rank": 0.92
    },
    { "unit_id": "...", "rank": 0.05 },
    { "unit_id": "...", "rank": 0.03 }
  ]
}
```

### 알고리즘
1. raw_text에서 한국어 키워드 추출 (수학 용어 정규화 — `a_n`, `점화식`, `일반항` 등)
2. `to_tsquery('simple', '키워드1 & 키워드2')` 생성
3. `SELECT ... ORDER BY ts_rank(search_vector, query) DESC LIMIT top_k`
4. 결과를 후보 JSON으로 반환

---

## Task 4: T4 — 문제 리서치 에이전트 프롬프트 통합

spec §3 프롬프트에 RAG 결과 주입:

```
[SYSTEM]
... (기존)

추가 컨텍스트:
Curriculum RAG가 다음 후보를 제안합니다:
{rag_result.candidates}

이 중 가장 적합한 unit/topic 1개를 선택해 출력 §4 스키마의 analysis.unit, analysis.topic에 사용하세요.
적합한 후보가 없으면 (모든 rank < 0.3) "기타"로 분류하고 routing_confidence를 0.5 이하로 표시하세요.
```

---

## Task 5: T5 — 정확도 측정 Harness (게이트 검증)

### Golden set
- `eval/curriculum-rag/golden-set.json` — KICE 기출 30문제 + 사람이 라벨링한 unit_id/topic_id 정답

### Runner
```ts
import goldenSet from './golden-set.json';

for (const item of goldenSet) {
  const result = await fetch('.../curriculum-lookup', {
    method: 'POST',
    body: JSON.stringify({ raw_text: item.text, subject_hint: 'math', top_k: 3 })
  });
  const { candidates } = await result.json();
  const top1 = candidates[0];
  const correct = top1.unit_id === item.expected_unit_id;
  results.push({ ...item, top1, correct });
}

const top1Accuracy = results.filter(r => r.correct).length / results.length;
console.log(`Top-1 정확도: ${(top1Accuracy * 100).toFixed(1)}%`);
```

### 게이트
- **Top-1 정확도 ≥ 70%** — P3 Task 4(route-subject) 진입 허용
- 미달 시: seed JSON 보강 (단원 description / sample_question 추가) → 재측정

---

## P3 Curriculum RAG 종료 시 체크포인트

- [ ] math.units.json ≥ 200 단원
- [ ] math.topics.json ≥ 200 토픽
- [ ] units / topics 테이블 마이그레이션 성공
- [ ] `curriculum-lookup` Edge Function 응답 시간 P95 < 300ms
- [ ] 골든셋 30문제 Top-1 정확도 ≥ 70%
- [ ] 문제 리서치 에이전트 프롬프트에 RAG 결과 주입 통합 완료

---

## 위험 + 롤백

| 위험 | 시그널 | 롤백 |
|---|---|---|
| Top-1 정확도 < 50% | 골든셋 측정 후 | seed JSON 폐기 → 한국 교육과정 원문 RAG로 전환 (pgvector + 임베딩) |
| 단원 트리 모호함 (수학1 vs 수학2 경계) | 같은 문제가 2개 단원에 분류됨 | 단원 코드에 grade_band 추가 (`math-1.X` / `math-2.X`) |
| seed JSON 작성 시간 폭증 | Task 1에서 200 단원 도달 못 함 | 우선순위 50 단원(점화식·수열극한·미분 등 자주 나오는 영역)으로 축소 후 출시 |

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.0 | 2026-05-18 | 초안. MVP 1차 수학 200 단원 + Postgres FTS + Edge Function 1개 + 70% 게이트로 잠금. |
