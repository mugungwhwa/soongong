# P3 OCR Spike — Mike 체크리스트 (비개발자 가이드)

목적: Mike가 직접 해야 하는 외부 액션 3개 + 끝나면 Claude에게 한 문장 던지기.
소요 시간: 1시간 (사진 찍는 시간 포함).

기술 세부 README는 [README.md](./README.md) 참고. 이 문서는 **Mike가 무엇을 클릭하고 무엇을 채우면 되는지**만 다룬다.

---

## ☑ 액션 1 — ANTHROPIC API 키 발급 (10분)

**왜 필요한가:** 3종 OCR 중 Claude vision runner가 이 키로 수능 사진을 읽는다.

**단계:**
1. https://console.anthropic.com 접속 → mikeikhoonkim1208@gmail.com 계정으로 로그인
2. 왼쪽 메뉴 **Settings → API Keys** 클릭
3. 우측 상단 **Create Key** 버튼 → 이름은 `soongong-p3-ocr-spike` 추천
4. 표시되는 키(`sk-ant-api03-...`)를 **즉시 복사** (창 닫으면 다시 못 봄)

**결제 카드:**
- 처음 가입이면 $5 무료 크레딧 제공. 본 spike는 10장 × 약 $0.012 = 약 $0.12 소비 예상이라 충분.
- 무료 크레딧 없으면 카드 등록 필요 (Settings → Billing). $5 정도만 충전해도 충분.

**키 저장 위치:**
- 키를 Mike PC의 안전한 곳(예: 1Password, 메모장)에 임시 저장
- 또는 Mike가 Claude(나)에게 **DM처럼 키 전체를 한 번 보여주면** 내가 `.env` 파일에 박는다. 키는 `.gitignore`로 보호되어 GitHub에 안 올라감.

---

## ☑ 액션 2 — 수능 수학 사진 10장 (30-45분)

**왜 10장인가:** 통계적으로 의미 있는 최소 표본. 1-2장으론 운빨, 10장은 패턴 보임.

**무엇을 찍는가:**
- 수능/모의고사 **수학 점화식** 문제 본문 (수열 단원 위주)
- 인쇄된 종이 OR 책 OR PDF 화면 캡처 — 어떤 거든 OK
- 학생 손글씨 풀이는 **제외** (풀이/낙서/별표는 OCR 노이즈)
- 어려움 분포: easy 4장 + medium 4장 + hard 2장 정도

**찍는 법:**
- 스마트폰 카메라 정상 모드 OK (특수 앱 불필요)
- 정면, 그림자 X, 손글씨 메모지 가리기
- 한 사진에 한 문제. 두 문제 한 컷 X

**파일명:**
- `001-점화식-기초.jpg`, `002-점화식-치환.jpg` 형식 (3자리 번호 + 짧은 설명)
- 확장자는 jpg 또는 png (어떤 거든 OK)

**저장 위치:**
- Mike PC에서 다음 폴더에 그대로 드래그:
  ```
  /Users/mike/Downloads/soongong/soongong-p3-ocr-spike/eval/p3-ocr-spike/golden/images/
  ```
- 또는 Mike가 폴더 어디 두든 알려주면 내가 옮긴다.

---

## ☑ 액션 3 — 정답 텍스트 10개 (15-20분)

**왜 필요한가:** OCR이 읽은 결과 vs 정답을 비교해서 정확도 점수를 매기려면 정답이 있어야 한다.

**무엇을 적는가:**
- 사진 안 **인쇄된 문제 본문 그대로** (낙서/풀이 제외)
- 수식은 `$...$`로 감싸기. 예: `$a_{n+1} = 2a_n + 1$`

**Mike가 LaTeX 모르면:**
- ChatGPT에 사진 업로드 + "이 문제 본문을 LaTeX로 그대로 옮겨줘" 한 마디면 끝남
- 또는 Mike가 사진만 폴더에 넣고 Claude(나)에게 "ground-truth는 너가 채워" 하면 내가 Claude vision으로 한 번 읽어서 초안 만들고 Mike가 검수만 함

**파일 위치:**
- 템플릿: `golden/ground-truth.example.json` (2개 케이스 예시 들어있음)
- Mike가 채울 파일: `golden/ground-truth.json` (위 파일 복사 후 10개 케이스로 확장)
- 또는 Mike가 사진만 채우면 내가 ground-truth 초안 만들기 OK

---

## ☑ 액션 4 — Claude에게 한 문장 (1초)

세 가지 끝나면 새 Claude 세션에서 다음 한 문장 던지기:

> "P3 OCR Phase B 시작. 키는 [붙여넣기] / 사진 10장은 golden/images에 넣었음 / ground-truth는 [내가 채움 / 너가 채워]"

세 정보만 알려주면 내가:
1. `.env`에 키 박기
2. `pnpm i` (의존성 설치, 약 3분)
3. 3종 runner 순차 실행 (약 10분)
4. `pnpm report`로 정확도 매트릭스 출력
5. P3 게이트(≥90% 9/10) 통과 여부 보고 + 후속 PR 생성

---

## ☑ 자주 묻는 질문

**Q: 사진을 10장 못 모으면?**
A: 5장이라도 시작 가능. 다만 통계적 신뢰는 낮아짐. README §"P3 게이트" 기준 미달 위험.

**Q: ANTHROPIC_API_KEY가 안 오면?**
A: Claude runner skip하고 Tesseract.js + Mathpix 2종으로 진행 가능. 단 결정 4(Hybrid: Claude vision 메인)와 충돌. 키 받는 게 깨끗.

**Q: Mathpix는 안 받아도 되나?**
A: Mathpix 없이도 2종 비교로 진행 가능. README에 명시. trial 1000 무료라 받으면 좋고, 안 받아도 spike는 진행됨.

**Q: 비용은?**
A: Anthropic ≈ $0.12, Mathpix trial 무료, Tesseract.js 무료. 총 $0.12 (커피값).

---

## 진척 상황 (이 문서 갱신용)

- [ ] 액션 1: ANTHROPIC_API_KEY 발급
- [ ] 액션 2: 수학 사진 10장 `golden/images/`에 저장
- [ ] 액션 3: `golden/ground-truth.json` 채움 (또는 Claude에게 위임)
- [ ] 액션 4: 새 Claude 세션에서 "P3 OCR Phase B 시작" 한 문장

세 가지 다 끝나면 본 spike가 P3 게이트 통과 여부 결정 → 본 구현 P4 진입 또는 manual 폴백 승격.
