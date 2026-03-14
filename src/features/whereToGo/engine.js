import { places } from '../../data/places.js';

// 기분 → vibe 매핑
const PLACE_MOOD_VIBES = {
  chill: ["고요함","힐링","평화로움","느긋함","편안한"],
  active: ["활동적","신나는","재미","해방감","성취감"],
  romantic: ["감성","로맨틱","특별함","영감","지적"],
  random: [],
};

// 현재 시간대 구하기
function getCurrentSlot() {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 14) return "afternoon";
  if (hour < 18) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

// 하드 필터: 시간대 + 실내/야외 + 누구랑
function filterPlaces(pa, curSlot, strict = true) {
  const filtered = places.filter(p => {
    if (strict && p.timeSlots && !p.timeSlots.includes(curSlot)) return false;
    if (pa?.inOut === "indoor" && p.type.includes("outdoor") && !p.type.includes("indoor")) return false;
    if (pa?.inOut === "outdoor" && p.type.includes("indoor") && !p.type.includes("outdoor")) return false;
    if (pa?.who === "alone" && p.withWho && !p.withWho.includes("alone")) return false;
    return true;
  });
  return filtered;
}

// 스코어링 (추천용 — 높은 가중치)
function scorePlaces(pool, pa, ctx, curSlot) {
  const moodVibes = PLACE_MOOD_VIBES[pa?.mood] || [];

  return pool.map(p => {
    let score = 0;

    // 분위기 매칭 +4
    if (moodVibes.length > 0) {
      score += p.vibe.filter(v => moodVibes.includes(v)).length * 4;
    }

    // 시간대 매칭 +3
    if (p.timeSlots?.includes(curSlot)) score += 3;

    // 누구랑 매칭 +3
    if (pa?.who && p.withWho?.includes(pa.who)) score += 3;

    // 예산 매칭 +2
    if (pa?.budget && p.budget?.includes(pa.budget)) score += 2;

    // 밤에 야외 페널티
    if (curSlot === "night" && p.type.includes("outdoor") && !p.name?.includes("야경")) score -= 2;

    // 혼자인데 데이트 태그 페널티
    if (pa?.who === "alone" && p.tags?.some(t => t.includes("데이트"))) score -= 2;

    // 연인 로맨틱 보너스
    if (pa?.who === "partner" && p.vibe?.includes("로맨틱")) score += 3;

    // 가족 보너스
    if (pa?.who === "family" && p.vibe?.some(v => ["활동적","자유로운","평화로움"].includes(v))) score += 2;

    // 다른 탭에서 넘어온 경우 context 보너스
    if (ctx?.from === "whatToDo" && ctx.activity) {
      if (ctx.activity.vibe && p.vibe?.some(v => ctx.activity.vibe.includes(v))) score += 3;
    }
    if (ctx?.from === "whatToEat") {
      // 음식 관련 장소 강력 보너스
      const foodPlaceTypes = ["cafe", "restaurant", "market", "bar"];
      const isFoodPlace = foodPlaceTypes.some(t => p.type?.includes(t))
        || p.tags?.some(t => ["맛집","먹방","먹거리","카페","브런치","디저트","길거리음식"].includes(t))
        || ["맛집 탐방","전통시장","포장마차/야시장","브런치 카페","편의점 앞 벤치"].includes(p.name);
      if (isFoodPlace) score += 10;
      // 음식과 무관한 장소 페널티 (마사지, 스파, 운동 등)
      const nonFoodTypes = ["relax", "sport", "nature"];
      const isNonFood = !isFoodPlace && nonFoodTypes.some(t => p.type?.includes(t));
      if (isNonFood) score -= 5;
    }

    score += Math.random() * 1.5;
    return { place: p, score };
  }).sort((a, b) => b.score - a.score);
}

// 추천 이유 생성
function buildReason(pa, ctx, curSlot) {
  const reasons = [];
  if (ctx?.from === "whatToDo") {
    reasons.push(`${ctx.activity?.emoji || "✨"} ${ctx.activity?.name} 하기 좋은 곳`);
  } else if (ctx?.from === "whatToEat") {
    reasons.push(`${ctx.food?.emoji || "🍽️"} ${ctx.food?.name || "맛집"} 먹으러`);
  } else {
    const moodLabel = { chill:"조용히 쉬고 싶을 때", active:"활동적으로 놀 때", romantic:"감성 충전" };
    if (pa?.mood && moodLabel[pa.mood]) reasons.push(moodLabel[pa.mood]);
  }
  const slotLabel = { morning:"아침", afternoon:"오후", evening:"저녁", night:"늦은 밤" };
  reasons.push(slotLabel[curSlot] + " 시간대");
  const whoLabel = { alone:"혼자", partner:"연인과 함께", family:"가족과 함께", friend:"친구와 함께" };
  if (pa?.who && whoLabel[pa.who]) reasons.push(whoLabel[pa.who]);
  return reasons.join(" · ");
}

/**
 * 장소 추천 (스코어 기반)
 * @param {Object} pa - 사용자 답변 { who, inOut, budget, mood }
 * @param {Object|null} ctx - 탭 간 연결 context { from, activity?, food? }
 * @returns {{ main, alternatives, reason }}
 */
export function recommendPlace(pa, ctx) {
  const curSlot = getCurrentSlot();

  // 하드 필터
  const filtered = filterPlaces(pa, curSlot, true);
  const pool = filtered.length >= 3
    ? filtered
    : filterPlaces(pa, curSlot, false); // 시간대 필터 제거하고 재시도

  // 스코어링
  const scored = scorePlaces(pool, pa, ctx, curSlot);

  return {
    main: scored[0]?.place,
    alternatives: scored.slice(1, 4).map(s => s.place),
    reason: buildReason(pa, ctx, curSlot),
  };
}

/**
 * 토너먼트용 bracket 생성 (상위 24개 → 셔플 → 16개)
 * @param {Object} pa - 사용자 답변
 * @param {Object|null} ctx - 탭 간 연결 context
 * @returns {Array} 16개 장소 bracket
 */
export function buildTournamentBracket(pa, ctx, bracketSize = 16) {
  const curSlot = getCurrentSlot();
  const moodVibes = PLACE_MOOD_VIBES[pa?.mood] || [];

  const filtered = filterPlaces(pa, curSlot, true);
  const pool = filtered.length >= 8 ? filtered : places;

  // 토너먼트용 스코어링 (추천보다 낮은 가중치)
  const scored = pool.map(p => {
    let score = 0;
    if (moodVibes.length > 0) score += p.vibe.filter(v => moodVibes.includes(v)).length * 3;
    if (p.timeSlots?.includes(curSlot)) score += 2;
    if (pa?.who && p.withWho?.includes(pa.who)) score += 2;
    if (pa?.budget && p.budget?.includes(pa.budget)) score += 1;
    if (ctx?.from === "whatToDo" && ctx.activity?.vibe) {
      score += p.vibe.filter(v => ctx.activity.vibe.includes(v)).length * 2;
    }
    if (ctx?.from === "whatToEat") {
      const foodPlaceTypes = ["cafe", "restaurant", "market", "bar"];
      const isFoodPlace = foodPlaceTypes.some(t => p.type?.includes(t))
        || p.tags?.some(t => ["맛집","먹방","먹거리","카페","브런치","디저트","길거리음식"].includes(t));
      if (isFoodPlace) score += 6;
      const nonFoodTypes = ["relax", "sport", "nature"];
      if (!isFoodPlace && nonFoodTypes.some(t => p.type?.includes(t))) score -= 4;
    }
    score += Math.random() * 1;
    return { ...p, score };
  }).sort((a, b) => b.score - a.score);

  const topN = Math.min(bracketSize + 8, scored.length);
  return [...scored.slice(0, topN)].sort(() => Math.random() - 0.5).slice(0, bracketSize);
}

// PLACE_MOOD_VIBES export (혹시 외부에서 필요할 때)
export { PLACE_MOOD_VIBES };
