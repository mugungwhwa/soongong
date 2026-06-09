import katex from "katex";
import type { FormulaFormat } from "@/shared/contracts";

type Part =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

function parseInline(text: string): Part[] {
  const parts: Part[] = [];
  const re = /\$([^$]+)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "inline", value: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

function parseMath(content: string): Part[] {
  const parts: Part[] = [];
  const re = /\$\$([^$]+)\$\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) parts.push(...parseInline(content.slice(last, m.index)));
    parts.push({ type: "block", value: m[1] });
    last = re.lastIndex;
  }
  if (last < content.length) parts.push(...parseInline(content.slice(last)));
  return parts;
}

interface MathRendererProps {
  content: string;
  format?: FormulaFormat;
  className?: string;
}

export function MathRenderer({ content, format = "plaintext", className }: MathRendererProps) {
  if (format === "plaintext") {
    return <span className={className}>{content}</span>;
  }

  const parts = parseMath(content);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "text") return <span key={i}>{part.value}</span>;
        const html = katex.renderToString(part.value, {
          displayMode: part.type === "block",
          throwOnError: false,
          trust: false,
        });
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: html }}
            className={part.type === "block" ? "block text-center my-2" : undefined}
          />
        );
      })}
    </span>
  );
}
