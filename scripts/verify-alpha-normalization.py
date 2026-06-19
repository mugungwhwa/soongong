#!/usr/bin/env python3
"""캐릭터 누끼(-alpha.png) 정규화 QA 게이트 — ui-master-design.md §4.13 재현성 보증.

검사 항목 (§4.13 절차 3·5):
  1) 정사각 1:1 캔버스
  2) 긴 변(max(bbox_w, bbox_h)) = 캔버스의 ~90% (종횡비 보존)
     → 세로로 긴 캐릭터는 좌우 패딩이 자연히 큼(정상). 짧은 변 90% 강제(=왜곡)는 검사 대상 아님.
  3) 중앙 정렬 (대칭 패딩)
  4) 4모서리 alpha=0 (배경 완전 투명)

사용:  python3 scripts/verify-alpha-normalization.py [file ...]
       (인자 없으면 apps/web/public/brand/sub-*-alpha.png 기본 검사)
종료코드: 전부 통과=0, 하나라도 미달=1
"""
import sys
import glob
from PIL import Image

LONGEST_MIN, LONGEST_MAX = 88.0, 92.0   # 긴 변 목표 ~90% (±2%p)
PAD_SYMMETRY_MAX = 3.0                   # 대칭 패딩 허용 편차(%p)


def check(path: str) -> bool:
    try:
        im = Image.open(path)
    except Exception as e:  # noqa: BLE001
        print(f"✗ {path}: 열기 실패 — {e}")
        return False
    if im.mode != "RGBA":
        print(f"✗ {path}: RGBA 아님(mode={im.mode}) — 알파 채널 없음")
        return False
    W, H = im.size
    alpha = im.split()[-1]
    bb = alpha.getbbox()
    if bb is None:
        print(f"✗ {path}: 불투명 픽셀 없음(빈 누끼)")
        return False
    ow, oh = bb[2] - bb[0], bb[3] - bb[1]
    longest = max(ow, oh)
    cov = 100 * longest / max(W, H)
    lpad, rpad = 100 * bb[0] / W, 100 * (W - bb[2]) / W
    tpad, bpad = 100 * bb[1] / H, 100 * (H - bb[3]) / H
    px = im.load()
    corners = [px[0, 0][3], px[W - 1, 0][3], px[0, H - 1][3], px[W - 1, H - 1][3]]

    fails = []
    if W != H:
        fails.append(f"정사각 아님({W}x{H})")
    if not (LONGEST_MIN <= cov <= LONGEST_MAX):
        fails.append(f"긴 변 {cov:.1f}% (목표 {LONGEST_MIN}~{LONGEST_MAX}%)")
    if abs(lpad - rpad) > PAD_SYMMETRY_MAX or abs(tpad - bpad) > PAD_SYMMETRY_MAX:
        fails.append(f"비대칭 패딩 L{lpad:.1f}/R{rpad:.1f} T{tpad:.1f}/B{bpad:.1f}")
    if any(c != 0 for c in corners):
        fails.append(f"모서리 alpha≠0 {corners}")

    name = path.split("/")[-1]
    if fails:
        print(f"✗ {name}: " + " | ".join(fails))
        return False
    print(f"✓ {name}: 긴 변 {cov:.1f}% (W={100*ow/W:.1f}% H={100*oh/H:.1f}%), "
          f"패딩 L{lpad:.1f}/R{rpad:.1f}/T{tpad:.1f}/B{bpad:.1f}%, 모서리 alpha=0")
    return True


def main() -> int:
    files = sys.argv[1:] or sorted(glob.glob("apps/web/public/brand/sub-*-alpha.png"))
    if not files:
        print("검사 대상 파일 없음")
        return 1
    ok = all(check(f) for f in files)
    print("\nRESULT:", "ALL PASS ✓" if ok else "FAIL ✗")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
