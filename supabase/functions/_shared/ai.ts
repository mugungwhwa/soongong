import Anthropic from "npm:@anthropic-ai/sdk@0";
import { zodToJsonSchema } from "npm:zod-to-json-schema@3";
import type { ZodTypeAny } from "npm:zod@3";

const client = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

export const CACHED_SYSTEM = {
  type: "text" as const,
  text: "당신은 한국 수능 교육 서비스의 컨텐츠 심사 전문가입니다. 학생이 올린 학습 자료의 저작권·개인정보 위험을 정확하게 분류합니다.",
  cache_control: { type: "ephemeral" as const },
};

export const OCR_SYSTEM = {
  type: "text" as const,
  text: "당신은 한국 수능 문제 이미지 OCR 전문가입니다. 문제 이미지에서 본문·선지·조건·수식·학생 필기를 정확하게 추출하여 구조화된 JSON으로 반환합니다. 수식은 LaTeX 형식으로 표현하고, 학생 메모나 밑줄·동그라미 등 표시는 student_note로 분리합니다.",
  cache_control: { type: "ephemeral" as const },
};

// SOO-64: 약점 정조준 변형 문항 출제 system. 난이도 레벨은 외부(get_target_difficulty)에서 지정 — 임의 변경 금지.
export const GEN_SYSTEM = {
  type: "text" as const,
  text: "당신은 한국 수능 문제 출제 전문가입니다. 학생이 틀린 바로 그 약점(오답 사유)을 다시 정확히 검증하는 변형 문항을 출제합니다. 숫자만 바꾼 복제나 약점과 무관한 새 문제가 아니라, 지정된 오답 사유를 정조준하는 문항을 만듭니다. 난이도 레벨은 외부에서 지정되며 임의로 바꾸지 않습니다.",
  cache_control: { type: "ephemeral" as const },
};

// SOO-64: 생성 직후 정답↔해설 정합성 검증 self-check system.
export const SELF_CHECK_SYSTEM = {
  type: "text" as const,
  text: "당신은 한국 수능 문항 검수 전문가입니다. 주어진 문항의 정답과 해설이 논리적으로 정합한지 엄격히 판정합니다. 해설의 풀이가 실제로 그 정답에 도달하고, 정답이 문제 조건을 만족할 때만 consistent=true입니다. 조금이라도 모순·계산오류·논리비약이 있으면 consistent=false.",
  cache_control: { type: "ephemeral" as const },
};

// 구조화 출력에 사용하는 기본 모델. generated_problems.generator_model 기록값과 동기화.
export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

// tier → 모델 id. fast=Haiku(기본), smart=Sonnet(생성 품질 직결 경로).
const MODEL_BY_TIER = {
  fast: DEFAULT_MODEL,
  smart: "claude-sonnet-4-6",
} as const;

export function getModel(tier: "fast" | "smart"): string {
  return MODEL_BY_TIER[tier];
}

async function callWithBackoff(
  fn: () => Promise<Anthropic.Message>,
  maxRetries = 3,
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // SDK 버전 드리프트 대비: RateLimitError 또는 status 429 인 모든 APIError 를 재시도 대상으로.
      const isRateLimit =
        err instanceof Anthropic.RateLimitError ||
        (err instanceof Anthropic.APIError && (err as { status?: number }).status === 429);
      if (!isRateLimit || attempt === maxRetries - 1) throw err;
      const delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 16_000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

export async function generateObject<T extends ZodTypeAny>({
  schema,
  messages,
  model,
  system = [CACHED_SYSTEM],
  toolDescription = "컴플라이언스 분류 결과를 구조화된 형식으로 반환합니다.",
  maxTokens = 1024,
}: {
  schema: T;
  messages: Anthropic.MessageParam[];
  model?: string | null;
  system?: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }>;
  toolDescription?: string;
  maxTokens?: number;
}): Promise<{ object: import("npm:zod@3").infer<T> }> {
  const jsonSchema = zodToJsonSchema(schema, { $refStrategy: "none" });

  const response = await callWithBackoff(() =>
    client.messages.create({
      model: model ?? DEFAULT_MODEL,
      max_tokens: maxTokens,
      system,
      tools: [
        {
          name: "structured_output",
          description: toolDescription,
          input_schema: jsonSchema as Anthropic.Tool["input_schema"],
        },
      ],
      tool_choice: { type: "tool", name: "structured_output" },
      messages,
    })
  );

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("structured_output tool not called");
  }

  const parsed = schema.parse(toolUse.input);
  return { object: parsed };
}
