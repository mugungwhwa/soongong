#!/usr/bin/env bash
# 순공대장 git hooks 활성화 스크립트
# clone 후 1회 실행하면 scripts/hooks/ 가 git hooks 디렉토리로 등록됨.
#
# 사용:
#   bash scripts/setup-hooks.sh
#
# 검증:
#   git config core.hooksPath  # → scripts/hooks 출력되면 OK

set -e

cd "$(git rev-parse --show-toplevel)"

if [ ! -d "scripts/hooks" ]; then
    echo "✗ scripts/hooks 디렉토리 없음. 본 스크립트는 repo 루트에서 실행."
    exit 1
fi

# 실행 권한 보장
chmod +x scripts/hooks/* 2>/dev/null || true

# git core.hooksPath 설정
git config core.hooksPath scripts/hooks

echo "✓ git core.hooksPath = scripts/hooks 설정 완료"
echo ""
echo "활성 hook:"
ls -1 scripts/hooks/ | sed 's/^/  - /'
echo ""
echo "테스트:"
echo "  echo '다크 네이비 테스트' > /tmp/test.md && git add /tmp/test.md"
echo "  (실제 add는 안 하고 dry-run으로 확인)"
echo ""
echo "우회: SKIP_PRECOMMIT=1 git commit ..."
