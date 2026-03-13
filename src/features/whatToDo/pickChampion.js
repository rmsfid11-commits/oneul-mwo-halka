/**
 * pickChampion.js
 * 오늘 뭐하지? — 메인 픽 하나를 강하게 뽑는 함수
 *
 * userInput 예시:
 * {
 *   vibe: ["고요함", "느리게"],       // 선택한 vibe 태그들
 *   timeSlot: "evening",             // morning / afternoon / evening / night
 *   weather: "cloudy",               // sunny / cloudy / rain
 *   energy: "low",                   // low / mid / high
 *   withWho: "혼자",                  // 혼자 / 같이 / 강아지랑
 *   budget: "무료",                   // 무료 / 조금 / 상관없어
 * }
 *
 * 반환:
 * {
 *   activity: { ...activity object },
 *   score: number,
 *   reason: string,   // "왜 오늘 너한테 맞는지" 한 줄
 *   hook: string,     // 더 짧고 강한 한 줄 (UI 메인 카드용)
 * }
 */

// ─── 상수 ────────────────────────────────────────────────────────────────────

const RARITY_BONUS = { weird: 12, uncommon: 6, common: 0 };

const TIMEСЛОТ_LABEL = {
  morning: "이 아침에",
  afternoon: "이 오후에",
  evening: "이 저녁에",
  night: "이 밤에",
};

const ENERGY_LABEL = {
  low: "지쳐있을 때",
  mid: "적당히 있을 때",
  high: "에너지 넘칠 때",
};

// ─── 핵심 스코어링 ────────────────────────────────────────────────────────────

/**
 * 하나의 activity에 대해 userInput과의 매칭 점수를 계산
 */
function scoreActivity(activity, userInput) {
  let score = 0;
  const { vibe = [], timeSlot, weather, energy, withWho, budget } = userInput;

  // 1. vibe 매칭 (가장 중요 — 최대 40점)
  const vibeMatches = vibe.filter(v => activity.vibe?.includes(v)).length;
  score += vibeMatches * 10;
  // vibe가 하나도 없으면 큰 패널티
  if (vibeMatches === 0) score -= 20;

  // 2. 시간대 (15점)
  if (activity.timeSlots?.includes(timeSlot)) score += 15;
  else score -= 10;

  // 3. 날씨 (10점)
  if (activity.weatherFit?.includes(weather)) score += 10;
  else score -= 15;

  // 4. 에너지 매칭 (15점)
  if (activity.energyBefore?.includes(energy)) score += 15;
  else score -= 5;

  // 5. 누구랑 (10점)
  if (withWho && activity.withWho?.includes(withWho)) score += 10;
  else score -= 5;

  // 6. 예산 (10점)
  if (budget && activity.budget?.includes(budget)) score += 10;
  // 예산 불일치는 패널티 없음 (사용자가 더 쓸 수도 있음)

  // 7. rarity 보너스 — weird/uncommon이 더 임팩트 있음
  score += RARITY_BONUS[activity.rarity] ?? 0;

  // 8. anchor role 선호 — 메인픽은 anchor가 맞음
  if (activity.role?.includes("anchor")) score += 8;

  return score;
}

// ─── 이유 문장 생성 ───────────────────────────────────────────────────────────

/**
 * "왜 오늘 이 활동인지" 설득력 있는 한 줄 생성
 */
function buildReason(activity, userInput, score) {
  const { timeSlot, energy, vibe = [] } = userInput;
  const timeLabel = TIMEСЛОТ_LABEL[timeSlot] ?? "지금";
  const energyLabel = ENERGY_LABEL[energy] ?? "";

  // vibe 중 activity와 겹치는 것들
  const matchedVibes = vibe.filter(v => activity.vibe?.includes(v));
  const vibeStr = matchedVibes.length > 0
    ? matchedVibes.slice(0, 2).join(", ") + "을 원한다면"
    : "";

  // hint를 베이스로 활용
  const hint = activity.hint ?? activity.summary ?? "";

  // 조합
  if (vibeStr) {
    return `${timeLabel} ${vibeStr} — ${hint}`;
  } else {
    return `${timeLabel} ${energyLabel}, ${activity.name}이(가) 딱이야. ${hint}`;
  }
}

/**
 * UI 메인 카드용 짧고 강한 훅 문장
 * hint 첫 문장 or summary 활용
 */
function buildHook(activity) {
  const hint = activity.hint ?? "";
  // 첫 문장만 추출
  const firstSentence = hint.split(".")[0].split("!")[0].split("?")[0].trim();
  return firstSentence || activity.summary || activity.name;
}

// ─── 메인 함수 ────────────────────────────────────────────────────────────────

/**
 * activities 배열에서 오늘의 챔피언 하나를 뽑아 반환
 *
 * @param {Array}  activities - activities.js의 전체 배열
 * @param {Object} userInput  - 사용자 입력 (vibe, timeSlot, weather, energy, withWho, budget)
 * @param {Object} [options]
 * @param {Array}  [options.excludeIds=[]]  - 제외할 activity id 목록
 * @param {number} [options.topN=5]         - 후보 상위 N개 중 랜덤 선택 (다양성)
 * @returns {{ activity, score, reason, hook } | null}
 */
export function pickChampion(activities, userInput, options = {}) {
  const { excludeIds = [], topN = 5 } = options;

  // 1. 필터링 — 날씨, 예산, 누구랑 하드 필터
  const candidates = activities.filter(a => {
    if (excludeIds.includes(a.id)) return false;

    // 날씨 하드 필터 (비 오는데 야외는 제외)
    if (userInput.weather === "rain" && a.placeType?.includes("outdoor")) return false;

    return true;
  });

  if (candidates.length === 0) return null;

  // 2. 스코어링
  const scored = candidates.map(a => ({
    activity: a,
    score: scoreActivity(a, userInput),
  }));

  // 3. 정렬 (내림차순)
  scored.sort((a, b) => b.score - a.score);

  // 4. 상위 N개 중 랜덤 (같은 조건이어도 매번 다른 픽)
  const pool = scored.slice(0, topN);
  // 점수에 비례한 가중 랜덤 (높을수록 자주 뽑힘)
  const minScore = Math.min(...pool.map(p => p.score));
  const weights = pool.map(p => Math.max(p.score - minScore + 1, 1));
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  let rand = Math.random() * totalWeight;
  let chosen = pool[0];
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) { chosen = pool[i]; break; }
  }

  // 5. 이유 + 훅 생성
  const reason = buildReason(chosen.activity, userInput, chosen.score);
  const hook = buildHook(chosen.activity);

  return {
    activity: chosen.activity,
    score: chosen.score,
    reason,
    hook,
  };
}

// ─── 사용 예시 ────────────────────────────────────────────────────────────────
/*
import { activities } from "./activities.js";
import { pickChampion } from "./pickChampion.js";

const result = pickChampion(activities, {
  vibe: ["고요함", "느리게", "혼자만의시간"],
  timeSlot: "evening",
  weather: "rain",
  energy: "low",
  withWho: "혼자",
  budget: "무료",
});

if (result) {
  console.log(result.activity.name);  // "반신욕"
  console.log(result.hook);           // "몸의 긴장이 풀리면 머리도 같이 풀려"
  console.log(result.reason);         // "이 저녁에 고요함, 느리게을 원한다면 — 몸의 긴장이..."
}
*/
