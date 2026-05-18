import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_MOCK_MODE: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_APP_NAME: z.string().default("순공대장"),
});

const parsed = EnvSchema.parse({
  NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

export const env = {
  NEXT_PUBLIC_MOCK_MODE: parsed.NEXT_PUBLIC_MOCK_MODE === "true",
  NEXT_PUBLIC_APP_NAME: parsed.NEXT_PUBLIC_APP_NAME,
};
