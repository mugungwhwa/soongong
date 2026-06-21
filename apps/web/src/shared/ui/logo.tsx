import Image from "next/image";

import { cn } from "@/shared/lib/cn";

/**
 * 순공대장 로고 — 단일 참조점.
 *
 * Mike 확정본 SVG 4종(KO/EN × light/mint)을 단일 컴포넌트로 슬롯인한다.
 * 자산은 `public/brand/logo/`가 소유(SOO-105, 무손실 경량화본). 형상·비율·색감은
 * 디자인 확정값 → 여기선 배치·렌더만 하고 절대 변형하지 않는다.
 *
 * 변형 의미:
 * - `light`: 투명 배경 + 그린 심볼/워드마크. 밝은 서피스 위에 얹는 lockup.
 * - `mint`: 민트 라운드 배지(자체 배경 포함). 독립 배지/스플래시/아이콘 맥락.
 * 언어:
 * - `ko`: 심볼 위 / "순공대장" 워드마크(세로 비율 461×334.7).
 * - `en`: "SOONGONG" 워드마크(가로 비율 665.9×271.8).
 *
 * 크기는 `className`(예: `h-9 w-auto`)으로 제어한다. width/height 속성은 종횡비
 * 힌트(레이아웃 시프트 방지)일 뿐이며, 실제 렌더는 SVG viewBox가 결정한다.
 *
 * 등장 모션(SOO-96 "로고 팝")은 호출부 motion 래퍼가 소유한다 — 이 컴포넌트는
 * 모션 의존성을 갖지 않아 어떤 래퍼 안에서도 안전하게 슬롯인된다.
 */

export type LogoLang = "ko" | "en";
export type LogoVariant = "light" | "mint";

// 종횡비 힌트용 정수 근사(viewBox 원본: ko 461×334.7 / en 665.9×271.8).
// 실제 벡터 렌더는 SVG viewBox가 결정하므로 이 값은 비율 힌트로만 쓰인다.
const LOGO_RATIO: Record<LogoLang, { width: number; height: number }> = {
  ko: { width: 461, height: 335 },
  en: { width: 666, height: 272 },
};

interface LogoProps {
  lang?: LogoLang;
  variant?: LogoVariant;
  /** 접근성 라벨. 기본 "순공대장". 장식용이면 빈 문자열 전달. */
  alt?: string;
  className?: string;
  /** LCP 후보(스플래시/랜딩 첫 화면)일 때만 true. */
  priority?: boolean;
}

export function Logo({
  lang = "ko",
  variant = "light",
  alt = "순공대장",
  className,
  priority = false,
}: LogoProps) {
  const ratio = LOGO_RATIO[lang];
  return (
    <Image
      src={`/brand/logo/soongong-logo-${lang}-${variant}.svg`}
      alt={alt}
      width={ratio.width}
      height={ratio.height}
      priority={priority}
      className={cn("w-auto", className)}
    />
  );
}
