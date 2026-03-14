# 오늘 뭐 할까 - 앱 전체 구조 설명서

> 기분/환경 기반 활동·음식·장소 추천 앱
> React + Vite + Supabase | Vercel 배포

---

## 프로젝트 기본 정보

- **URL**: oneul-mwo-halka.vercel.app
- **GitHub**: github.com/rmsfid11-commits/oneul-mwo-halka
- **기술**: React 19 + Vite 7 + Supabase (피드백 저장)
- **배포**: Vercel (main 브랜치 push 시 자동 배포)

---

## 파일 구조

```
src/
├── App.jsx                          ← 메인 라우터 (115줄, 공유 상태 + 탭바)
├── main.jsx                         ← React 진입점
├── index.css                        ← 공통 스타일 + 애니메이션
├── lib/
│   └── supabase.js                  ← Supabase 클라이언트
├── components/
│   ├── WhatToDo.jsx                 ← 뭐 할까 탭 (1323줄)
│   ├── WhatToEat.jsx                ← 뭐 먹지 탭 (710줄)
│   └── WhereToGo.jsx                ← 어디 가지 탭 (573줄)
├── data/
│   ├── activities.js                ← 활동 데이터 191개+
│   ├── foods.js                     ← 음식 데이터
│   └── places.js                    ← 장소 데이터 50개
└── features/
    ├── whatToDo/
    │   └── courseBuilder.js          ← 코스 조립 엔진
    ├── whatToEat/
    │   └── engine.js                ← 음식 추천 엔진
    └── whereToGo/
        └── engine.js                ← 장소 추천 엔진 (현재 미사용)
```

### 컴포넌트 구조 (리팩토링 완료)

```
App.jsx (라우터)
├── 공유 상태: tab, answers, sodaKeys, sodaColorRef, hideTabBar, pendingPlaceContext
├── goToPlaceFromContext() — 탭 간 연결 함수
├── 탭바 렌더링 (hideTabBar로 토너먼트 중 숨김)
│
├── <WhatToDo />
│   props: answers, setAnswers, sodaKeys, setSodaKeys, sodaColorRef, onHideTabBar, goToPlaceFromContext
│   자체 상태: screen, courses, bracket, champion, onboarding 등 25개+
│
├── <WhatToEat />
│   props: sodaKeys, setSodaKeys, sodaColorRef, onHideTabBar, goToPlaceFromContext
│   자체 상태: foodScreen, foodAnswers, foodBracket, foodChampion 등 18개+
│
└── <WhereToGo />
    props: sodaKeys, setSodaKeys, sodaColorRef, onHideTabBar, pendingPlaceContext, onClearPendingContext
    자체 상태: placeScreen, placeAnswers, placeBracket, placeChampion 등 10개
```

---

## 3개 탭 구조

### 1. 뭐 할까 (whatToDo) ✅

**파일:** `src/components/WhatToDo.jsx`

**화면 흐름:**
```
온보딩 (처음만) → 설정 (질문5개) → 취향 찾기 (16강 토너먼트) → 결과 (코스3개)
                                  → 그냥 골라줘 (스킵)
                                  → 도전 모드 (안해본것만)
```

**온보딩:**
- 좋아하는 느낌 16개 중 최대 5개 선택 (소다 카드 애니메이션)
- 절대 안 하는 것 21개 선택 (블랙리스트)
- localStorage에 저장, 다음부터 스킵

**질문 5개:**
| 질문 | 선택지 | 서브옵션 |
|------|--------|----------|
| 기분 (need) | 힐링/성취감/자극/멍때리기 | 각 3~4개 세부 |
| 누구랑 (alone) | 혼자/강아지/같이 | 혼자: 3개, 같이: 4개 |
| 실내/야외 (location) | 집/밖 | 밖: 동네/드라이브/자연 |
| 예산 (cost) | 0원/조금/상관없어 | 없음 |
| 시간 (hours) | 슬라이더 30분~48시간 | 없음 |

**토너먼트:**
- matchActivities()로 점수 매긴 후 상위 24개 → 셔플 → 16개 bracket
- 16강 → 8강 → 4강 → 결승 (소다 액체 올라오기 + 버블 애니메이션)
- 우승자 = champion

**결과:**
- 오늘의 픽: champion 기반 hook + reason
- 코스 3개: buildCoursePlans() 엔진으로 생성
  - anchor 활동 선택 → filler 연결 → closing 마무리
  - 식사 자동 삽입 (2시간+이면)
  - 장르 중복 방지, 실내↔야외 전환 최대 1회
- 패자부활전: 토너먼트에서 탈락한 활동 다시 선택 가능
- 피드백: Supabase에 코스 평가 저장
- "📍 이거 어디서 하지?" → 어디가지 탭 연결

**학습 시스템:**
- 토너먼트에서 선택한 활동의 vibe 누적 → localStorage
- 다음 매칭 시 학습된 vibe에 가산점
- 최근 30개 활동 히스토리 → 중복 방지

---

### 2. 뭐 먹지 (whatToEat) ✅

**파일:** `src/components/WhatToEat.jsx`

**화면 흐름:**
```
홈 → 내 취향 음식 찾기 → 질문4개 → 16강 토너먼트 → 결과 (후식 애니메이션)
   → 랜덤 룰렛 (카테고리별)
```

**질문 4개:**
| 질문 | 선택지 |
|------|--------|
| 제외 음식 (exclude) | 매운거/날것/육류/해산물/유제품 등 |
| 누구랑 (withWho) | 혼자/연인/친구/가족 |
| 음식 종류 (category) | 한식/일식/양식/중식 등 13개 |
| 지금 상태 (mood) | 든든하게/가볍게/매콤하게/달달하게/빠르게 |

**토너먼트:**
- matchFoods()로 점수 매긴 후 16개 bracket
- 소다 애니메이션 동일

**결과 + 후식 추천:**
- 우승 음식 표시 (카드 뒤집으면 상식 보기)
- 1.5초 후 점 3개 순차 표시 (dots 애니메이션)
- 3초 후 연기 퍼엉 + 후식 카드 등장 (smoke blob 22개)
- 패자부활전
- "📍 이거 어디서 먹지?" → 어디가지 탭 연결

**룰렛:**
- 카테고리 선택 → 돌려! → 빠르게 회전하다 멈춤

---

### 3. 어디 가지 (whereToGo) ✅

**파일:** `src/components/WhereToGo.jsx`

**화면 흐름:**
```
홈 → 빠른 추천 (기분 4버튼 → 바로 결과)
   → 내 취향 장소 찾기 (16강 토너먼트)
   → 세부 설정 → 장소 추천받기 (스코어 기반)
                → 내 취향 장소 찾기 (토너먼트)
```

**질문 4개:**
| 질문 | 선택지 |
|------|--------|
| 누구랑 (who) | 혼자/연인/친구/가족 |
| 실내/야외 (inOut) | 실내/야외/상관없어 |
| 예산 (budget) | 가볍게/적당히/넉넉하게 |
| 기분 (mood) | 조용히 쉬고 싶어/활동적/감성 충전/아무데나 |

**결과:**
- 메인 추천 + 대안 3개
- 구글맵 + 카카오맵 링크 버튼
- 체류 시간, 태그 표시

---

## 탭 간 연결

```
App.jsx의 goToPlaceFromContext() 함수가 중개

뭐할까 결과 → "📍 이거 어디서 하지?" → goToPlaceFromContext() → pendingPlaceContext → 어디가지
뭐먹지 결과 → "📍 이거 어디서 먹지?" → goToPlaceFromContext() → pendingPlaceContext → 어디가지
```

**자동 변환 매핑:**
| 뭐할까 | → | 어디가지 |
|--------|---|----------|
| need: 힐링/멍때리기 | → | mood: chill |
| need: 성취감/자극 | → | mood: active |
| alone: 혼자 | → | who: alone |
| subs.alone: 연인 | → | who: partner |
| location: home | → | inOut: indoor |
| cost: 무료 | → | budget: low |

연결 시 context 보너스:
- 뭐할까에서: 활동 vibe와 겹치는 장소에 +3점
- 뭐먹지에서: 맛집/먹방 태그 장소에 +4점

---

## 데이터 구조

### 활동 (activities.js)
```js
{
  id: 1,
  name: "명상",
  emoji: "🧘",
  genre: "healing",
  time: 30,              // 소요 시간 (분)
  summary: "...",
  hint: "...",
  tags: {
    need: ["힐링"],
    alone: ["혼자", "같이"],
    location: ["home", "out"],
    cost: ["무료"],
    energy: ["low"]
  },
  vibe: ["고요함", "몸회복"],
  role: ["filler", "closing"],
  goodAfter: ["fitness"],
  goodBefore: ["relax"],
  timeSlots: ["morning", "evening", "night"],
  rarity: "normal",       // normal | weird
  withWho: ["alone"],
}
```

### 음식 (foods.js)
```js
{
  id: "food_001",
  name: "김치찌개",
  emoji: "🍲",
  category: ["한식"],
  mood: ["든든하게", "매콤하게"],
  budget: ["low"],
  duration: 30,
  summary: "...",
  trivia: "...",           // 상식 (카드 뒤집기)
  tags: ["한식", "찌개"],
  exclude: [],
  withWho: ["alone", "friend", "family"],
  afterFood: ["식혜", "수정과"],  // 후식 추천
}
```

### 장소 (places.js)
```js
{
  id: "place_001",
  name: "조용한 카페",
  emoji: "☕",
  summary: "...",
  type: ["cafe"],               // 장소 유형
  vibe: ["고요함", "감성"],      // 분위기
  withWho: ["alone", "partner"],
  budget: ["low", "mid"],
  stayDuration: 60,             // 평균 체류 시간 (분)
  timeSlots: ["afternoon", "evening"],
  weatherFit: ["sunny", "cloudy", "rain"],
  goodAfter: ["reading", "walk"],
  goodBefore: ["bookstore"],
  tags: ["조용함", "오래머물기"],
}
```

---

## 핵심 엔진 로직

### courseBuilder.js (코스 조립)
```
1. getAnchorCandidates() → 핵심 활동 후보 8개 (20분~시간의 40~60%)
2. 앵커 5개 선택 (장르 다양성 보장)
3. 각 앵커별 코스 빌드:
   - pickNextActivity() → 다음 활동 (장르 중복 방지, 공간 전환 제한)
   - injectMealIfNeeded() → 2시간+ 코스에 식사 자동 삽입
4. dedupePlans() → 코스 간 60% 이상 겹치면 제거
5. sortByTimeSlot() → 시간대별 활동 순서 정렬
6. 최종 3개 코스 반환 (title + reason + activities + totalMinutes)
```

### 매칭 점수 체계
```
활동 매칭 (WhatToDo.jsx - matchActivities):
  +5  need 일치
  +4  alone 일치
  +4  location 일치
  +2  cost 일치
  +3  vibe 서브옵션 일치 (per match)
  +3  장르 보너스 (같이 모드)
  +6  연인 전용 활동 (withWho: couple)
  -10 시간대 불일치 (감점만, 하드필터 아님)

음식 매칭 (WhatToEat.jsx - matchFoods):
  하드필터: exclude 태그, 시간대 필터
  +5  category 일치
  +4  mood 일치
  +3  withWho 일치

장소 추천 (WhereToGo.jsx - doPlaceRecommend):
  +4  분위기(mood) 일치 (per match)
  +3  시간대 일치
  +3  누구랑 일치
  +2  예산 일치
  +3  context 보너스 (뭐할까 연결)
  +4  context 보너스 (뭐먹지 연결)
  -2  혼자인데 데이트 태그
  -2  밤에 야외
```

---

## 애니메이션 시스템

### 소다 카드 (온보딩 + 토너먼트)
- `sodaColorRef`: 색상 쌍 저장 (배경색, 강조색) — App.jsx에서 관리
- `sodaKeys`: re-render 트리거 (키가 바뀌면 애니메이션 재시작) — App.jsx에서 관리
- CSS 애니메이션 (index.css):
  - `liquidRise`: 액체 올라오기 (1.5s)
  - `waveScroll`: 파도 움직임 (2s infinite)
  - `bubbleFloat`: 거품 떠오르기
  - `shakeCan`: 캔 흔들기 (0.55s)

### 후식 추천 (뭐먹지 결과)
- `afterPhase`: idle → dots → show
- dots: 점 3개 순차 표시 (0.5초 간격)
- show: smoke blob 22개 방사형 확산 + 카드 등장
  - `smokeBurst`: 연기 퍼짐 (1.3~2.2s)
  - `cardShaar`: 카드 스르륵 등장 (1.4s)

---

## 상태 관리 요약

### App.jsx 공유 상태 (6개)
| 상태 | 용도 |
|------|------|
| `tab` | 현재 탭 (whatToDo/whatToEat/whereToGo) |
| `answers` | 뭐할까 질문 답변 (탭 간 연결에도 사용) |
| `sodaKeys` | 소다 애니메이션 트리거 (모든 토너먼트) |
| `sodaColorRef` | 소다 색상 저장 (ref) |
| `hideTabBar` | 토너먼트 중 탭바 숨김 |
| `pendingPlaceContext` | 탭 간 연결 데이터 전달용 |

### WhatToDo.jsx 자체 상태 (25개+)
`screen`, `courses`, `selectedCourse`, `onboardingStep`, `tempVibes`, `tempBlacklist`, `expanded`, `matched`, `bracket`, `matchIdx`, `roundWinners`, `champion`, `picking`, `mySchedule`, `suggestions`, `showModal`, `showResultModal`, `champFlipped`, `tournamentHistory`, `challengeMode`, `championPick`, `showRunnerUps`, `feedbackOpen`, `feedbackSent`, `schedule`, `flipped`

### WhatToEat.jsx 자체 상태 (18개+)
`foodScreen`, `foodStep`, `foodAnswers`, `foodResult`, `rouletteCat`, `rouletteFood`, `spinning`, `spinDisplay`, `flippedFoods`, `foodBracket`, `foodMatchIdx`, `foodRoundWinners`, `foodChampion`, `foodPicking`, `foodTourneyHistory`, `showFoodRunnerUps`, `afterDots`, `afterPhase`, `afterBurstKey`

### WhereToGo.jsx 자체 상태 (10개)
`placeScreen`, `placeResult`, `placeAnswers`, `placeContext`, `placeBracket`, `placeMatchIdx`, `placeRoundWinners`, `placeChampion`, `placePicking`, `placeTourneyHistory`

---

## 외부 저장소

### localStorage
| 키 | 용도 |
|----|------|
| `vibe_onboarded` | 온보딩 완료 여부 ("1") |
| `vibe_prefs` | 취향 설정 { vibes, blacklist } |
| `vibe_feedback` | 누적 취향 점수 { vibe: count } |
| `vibe_history` | 최근 30개 활동 ID 배열 |

### Supabase
| 테이블 | 용도 |
|--------|------|
| `course_feedback` | 코스 피드백 (reason_id, answers, champion_id 등) |

---

## 향후 가능한 작업
- Google Calendar 연동 (코스 → 일정 등록)
- 날씨 API (비 오면 야외 자동 제외)
- whereToGo/engine.js로 로직 분리 (현재 WhereToGo.jsx에 직접 구현)
- PWA 오프라인 지원
- 사용자 계정 (Supabase Auth)
