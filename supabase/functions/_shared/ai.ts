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

export function getModel(_tier: "fast" | "smart") {
  return client.messages;
}

async function callWithBackoff(
  fn: () => Promise<Anthropic.Message>,
  maxRetries = 3,
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit =
        err instanceof Anthropic.RateLimitError ||
        (err instanceof Anthropic.APIStatusError && (err as Anthropic.APIStatusError).status === 429);
      if (!isRateLimit || attempt === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 16_000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

export async function generateObject<T extends ZodTypeAny>({
  schema,
  messages,
  model: _model,
  system = [CACHED_SYSTEM],
  toolDescription = "컴플라이언스 분류 결과를 구조화된 형식으로 반환합니다.",
}: {
  schema: T;
  messages: Anthropic.MessageParam[];
  model: ReturnType<typeof getModel>;
  system?: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }>;
  toolDescription?: string;
}): Promise<{ object: import("npm:zod@3").infer<T> }> {
  const jsonSchema = zodToJsonSchema(schema, { $refStrategy: "none" });

  const response = await callWithBackoff(() =>
    client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
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
