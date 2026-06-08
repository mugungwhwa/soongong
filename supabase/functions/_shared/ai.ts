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

export function getModel(tier: "fast" | "smart") {
  return tier === "fast"
    ? client.messages
    : client.messages;
}

export async function generateObject<T extends ZodTypeAny>({
  schema,
  messages,
  model: _model,
}: {
  schema: T;
  messages: Anthropic.MessageParam[];
  model: ReturnType<typeof getModel>;
}): Promise<{ object: import("npm:zod@3").infer<T> }> {
  const jsonSchema = zodToJsonSchema(schema, { $refStrategy: "none" });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: [CACHED_SYSTEM],
    tools: [
      {
        name: "structured_output",
        description: "컴플라이언스 분류 결과를 구조화된 형식으로 반환합니다.",
        input_schema: jsonSchema as Anthropic.Tool["input_schema"],
      },
    ],
    tool_choice: { type: "tool", name: "structured_output" },
    messages,
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("structured_output tool not called");
  }

  const parsed = schema.parse(toolUse.input);
  return { object: parsed };
}
