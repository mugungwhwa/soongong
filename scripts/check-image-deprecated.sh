#!/usr/bin/env bash
# 순공대장 — 이미지 폐기어 OCR 검출 게이트 (SOO-22)
# ─────────────────────────────────────────────────────────────
# WHY: 텍스트 grep(pre-commit, lint)은 PNG/JPG 안에 박힌 글자를 못 본다.
#      Day7 디자인 리포트가 web_ui.png 안의 "회독마왕/해마왕"을 "0건"으로
#      오판한 근본 원인이 이 사각. 본 게이트가 그 구멍을 메운다.
#      (근거: CLAUDE.md §8 폐기 정책 + 부모 이슈 SOO-20)
#
# 의존성: tesseract OCR + 한국어 언어팩(kor)
#   macOS:  brew install tesseract tesseract-lang
#   Ubuntu: sudo apt-get install -y tesseract-ocr tesseract-ocr-kor
#
# 사용:
#   bash scripts/check-image-deprecated.sh            # 전체 시각 자산 스캔 (CI/Day7 리포트)
#   bash scripts/check-image-deprecated.sh --all      # 위와 동일(명시)
#   bash scripts/check-image-deprecated.sh --staged   # staged 이미지만 (pre-commit용)
#
# 종료 코드:
#   0  폐기어 미검출 (통과)
#   1  폐기어 검출 (게이트 fail)
#   2  OCR 도구/언어팩 없음 — 검증 불가 (--all 모드에서만 비0; --staged는 graceful skip)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

RED=$'\033[0;31m'
YEL=$'\033[0;33m'
GRN=$'\033[0;32m'
CYN=$'\033[0;36m'
RST=$'\033[0m'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

MODE="all"
case "${1:-}" in
    --staged) MODE="staged" ;;
    --all|"") MODE="all" ;;
    -h|--help)
        sed -n '2,30p' "$0"
        exit 0
        ;;
    *)
        echo "${RED}알 수 없는 인자: $1${RST} (사용: --all | --staged)"
        exit 2
        ;;
esac

# ─────────────────────────────────────────────────────────────
# 1. 폐기어 패턴 (CLAUDE.md §8 + SOO-22 DoD 기준)
#    - CANON: 정식 폐기어 (고신뢰)
#    - RECALL: OCR 오인식까지 잡는 distinctive 토큰 (고재현)
#      라이트 스터디 가든 톤에서 "마왕"은 정상적으로 등장할 수 없으므로
#      "채마왕"(해마왕 OCR 오인) 같은 변형도 포착한다.
# ─────────────────────────────────────────────────────────────
declare -a CANON_PATTERNS=(
    "회독마왕"
    "해마왕"
    "Dark Study RPG"
    "Dark RPG"
    "다크 네이비"
    "다크네이비"
)
declare -a RECALL_PATTERNS=(
    "마왕"
)

# grep -iE 용 통합 정규식 (대소문자 무시)
JOINED=""
for p in "${CANON_PATTERNS[@]}" "${RECALL_PATTERNS[@]}"; do
    JOINED="${JOINED:+$JOINED|}${p}"
done

# ─────────────────────────────────────────────────────────────
# 2. 대상 이미지 수집
#    대상: 시안/시각 자산 PNG·JPG (CLAUDE.md §2 이미지 SSoT)
# ─────────────────────────────────────────────────────────────
declare -a TARGET_GLOBS=(
    "web_ui.png"
    "app_UI.png"
    "docs/visual-assets"
    "apps/web/public/mascot"
)

collect_all() {
    # 대상 글롭 하위의 png/jpg/jpeg 전부
    for g in "${TARGET_GLOBS[@]}"; do
        if [ -f "$g" ]; then
            printf '%s\n' "$g"
        elif [ -d "$g" ]; then
            find "$g" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) 2>/dev/null
        fi
    done | sort -u
}

collect_staged() {
    # staged(ACM)된 파일 중 대상 글롭에 속하는 이미지만
    local staged
    staged=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)
    [ -z "$staged" ] && return 0
    local imgs
    # grep은 무매치 시 exit 1 → set -e/pipefail에 죽지 않게 || true로 흡수.
    imgs=$(echo "$staged" | grep -iE '\.(png|jpg|jpeg)$' || true)
    [ -z "$imgs" ] && return 0
    echo "$imgs" | while IFS= read -r f; do
        for g in "${TARGET_GLOBS[@]}"; do
            case "$f" in
                "$g"|"$g"/*) printf '%s\n' "$f"; break ;;
            esac
        done
    done | sort -u
}

if [ "$MODE" = "staged" ]; then
    IMAGES=$(collect_staged)
else
    IMAGES=$(collect_all)
fi

if [ -z "$IMAGES" ]; then
    if [ "$MODE" = "staged" ]; then
        # staged 대상 이미지 없음 → 검사 불필요, 통과
        exit 0
    fi
    echo "${YEL}대상 이미지 없음 (글롭: ${TARGET_GLOBS[*]})${RST}"
    exit 0
fi

# ─────────────────────────────────────────────────────────────
# 3. OCR 도구 가용성 확인
# ─────────────────────────────────────────────────────────────
ocr_unavailable() {
    echo "${YEL}⊘ tesseract OCR 또는 한국어(kor) 언어팩 없음 — 이미지 폐기어 게이트를 실행할 수 없음${RST}"
    echo "  설치:"
    echo "    macOS : brew install tesseract tesseract-lang"
    echo "    Ubuntu: sudo apt-get install -y tesseract-ocr tesseract-ocr-kor"
}

if ! command -v tesseract >/dev/null 2>&1 || ! tesseract --list-langs 2>/dev/null | grep -qx "kor"; then
    ocr_unavailable
    if [ "$MODE" = "staged" ]; then
        # 로컬 commit을 막지 않음 — 텍스트 게이트는 계속 동작.
        echo "  (pre-commit: 이미지 게이트만 건너뜀, exit 0. CI의 --all 게이트가 최종 검증)"
        exit 0
    fi
    exit 2
fi

# ─────────────────────────────────────────────────────────────
# 4. OCR 스캔 + 폐기어 매칭
# ─────────────────────────────────────────────────────────────
TMPDIR_OCR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_OCR"' EXIT

VIOLATIONS=0
SCANNED=0

echo "${CYN}이미지 폐기어 OCR 스캔 시작 (mode=${MODE}, lang=kor+eng)${RST}"

while IFS= read -r img; do
    [ -z "$img" ] && continue
    [ -f "$img" ] || continue
    SCANNED=$((SCANNED + 1))

    out="$TMPDIR_OCR/ocr_$SCANNED"
    # 파일 출력이 stdout 파이프보다 안정적(인코딩/버퍼링 이슈 회피).
    if ! tesseract "$img" "$out" -l kor+eng >/dev/null 2>&1; then
        echo "${YEL}⚠  OCR 실패(스킵): ${img}${RST}"
        continue
    fi

    matched=$(grep -inE "$JOINED" "$out.txt" 2>/dev/null || true)
    if [ -n "$matched" ]; then
        echo ""
        echo "${RED}✗ 폐기어 검출: ${img}${RST}"
        # 매칭된 OCR 라인(번호 포함)을 컨텍스트로 출력.
        # 좌표는 한국어 OCR 토큰 분할 한계로 best-effort(라인 컨텍스트)로 대체.
        while IFS= read -r line; do
            lineno="${line%%:*}"
            text="${line#*:}"
            # 어떤 패턴이 걸렸는지 표기
            hits=""
            for p in "${CANON_PATTERNS[@]}" "${RECALL_PATTERNS[@]}"; do
                if echo "$text" | grep -iqF "$p"; then
                    hits="${hits:+$hits, }$p"
                fi
            done
            echo "    ${YEL}[L${lineno}]${RST} 매칭어: ${RED}${hits}${RST}"
            echo "         OCR 라인: ${text}"
            VIOLATIONS=$((VIOLATIONS + 1))
        done <<< "$matched"
    fi
done <<< "$IMAGES"

# ─────────────────────────────────────────────────────────────
# 5. 최종 판정
# ─────────────────────────────────────────────────────────────
echo ""
if [ "$VIOLATIONS" -gt 0 ]; then
    echo "${RED}✗ 이미지 폐기어 ${VIOLATIONS}건 검출 (스캔 ${SCANNED}개)${RST}"
    echo "  근거: CLAUDE.md §8 폐기 정책 — 시각 자산에도 회귀어가 남으면 안 됨"
    echo "  조치: 해당 자산 교체(SOO-20 A1) 후 재실행."
    echo "  (OCR 오인식 가능성 있음 — 실제 이미지를 직접 확인 후 판단)"
    exit 1
fi

echo "${GRN}✓ 이미지 폐기어 미검출${RST} (스캔 ${SCANNED}개, 패턴 $(( ${#CANON_PATTERNS[@]} + ${#RECALL_PATTERNS[@]} ))종)"
exit 0
