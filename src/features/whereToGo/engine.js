import { places } from '../../data/places.js';

// 기분 → vibe 매핑
const PLACE_MOOD_VIBES = {
  chill: ["고요함","힐링","평화로움","느긋함","편안한"],
  active: ["활동적","신나는","재미","해방감","성취감"],
  romantic: ["감성","로맨틱","특별함","영감","지적"],
  random: [],
};

// 활동 장르 → 어울리는 장소 이름/태그/타입 매핑
// ⚠️ 이름은 반드시 places.js의 실제 name 값 기준 (부분 매칭 = includes)
const GENRE_PLACE_MAP = {
  // 기존 10개 (깨진 참조 수정)
  cooking:  { names:["대형마트","전통시장","푸드코트","맛집 탐방","쿠킹클래스","식재료"], tags:["장보기","먹거리","시식","요리"], types:["market","restaurant","craft"] },
  cafe:     { names:["카페","브런치"], tags:["카페","브런치","디저트","커피"], types:["cafe"] },
  art:      { names:["전시회/갤러리","박물관/과학관","복합문화공간"], tags:["전시","문화생활"], types:["culture","craft"] },
  reading:  { names:["독립서점","도서관","서점/독서카페","대형서점","스터디카페"], tags:["서점","독서"], types:["culture"] },
  exercise: { names:["공원/하천","한강공원","둘레길/산책로","호수공원"], tags:["운동","산책","활동적"], types:["nature","walk","outdoor"] },
  music:    { names:["레코드샵/음반가게","공연/뮤지컬","복합문화공간"], tags:["음악","라이브","공연"], types:["culture"] },
  game:     { names:["만화카페/멀티방","복합문화공간"], tags:["게임"], types:["indoor"] },
  photo:    { names:["사진관/셀프스튜디오","전시회/갤러리","감성 벽화마을","핫플"], tags:["사진","인스타","포토"], types:["culture"] },
  walk:     { names:["공원/하천","둘레길/산책로","한강공원","해변/강변","짧게 걷기 좋은 동네"], tags:["산책","자연","바다"], types:["nature","walk","outdoor"] },
  shopping: { names:["쇼핑몰/아울렛","백화점","올리브영","편집샵/셀렉트샵"], tags:["쇼핑","쇼핑몰"], types:["shopping"] },

  // 추가 15개 장르
  tidy:     { names:["다이소/문구점","대형마트","올리브영"], tags:["정리","수납","인테리어"], types:["shopping","indoor"] },
  culture:  { names:["전시회/갤러리","박물관/과학관","공연/뮤지컬","복합문화공간","영화관"], tags:["문화생활","전시","공연"], types:["culture"] },
  healing:  { names:["온천/스파","찜질방/사우나","명상센터","사찰/절","수목원/식물원"], tags:["힐링","마음챙김","이완"], types:["relax","nature"] },
  travel:   { names:["드라이브 코스","해안도로","터미널","제주 올레길","한옥마을","게스트하우스"], tags:["드라이브","여행","당일치기"], types:["drive","outdoor","view"] },
  sport:    { names:["한강공원","공원/하천","둘레길/산책로","해변/강변"], tags:["운동","자전거","활동적"], types:["nature","walk","outdoor"] },
  nature:   { names:["수목원/식물원","공원/하천","해변/강변","호수공원","둘레길/산책로","실내 식물원"], tags:["자연","힐링","산책"], types:["nature","outdoor"] },
  water:    { names:["해변/강변","한강공원","해운대/광안리","해안도로","새벽 한강","아쿠아리움"], tags:["바다","물","해변"], types:["outdoor","nature","view"] },
  food:     { names:["맛집 탐방","포장마차/야시장","한강 치맥","푸드코트","고깃집","분식집","찜닭골목"], tags:["맛집","먹방","맛있는","먹거리"], types:["restaurant","market"] },
  camp:     { names:["글램핑장","펜션","게스트하우스","농장체험"], tags:["캠핑","야외숙박","글램핑"], types:["outdoor"] },
  craft:    { names:["쿠킹클래스/원데이클래스","빈티지/플리마켓","농장체험","복합문화공간"], tags:["만들기","DIY","체험"], types:["craft"] },
  digital:  { names:["스터디카페","도서관","작업하기 좋은 카페","24시 카페"], tags:["작업","온라인"], types:["cafe","culture"] },
  social:   { names:["바/펍","고깃집","한강 치맥","포장마차/야시장","번화가"], tags:["친구","술","모임"], types:["bar","restaurant"] },
  learn:    { names:["도서관","박물관/과학관","대형서점","복합문화공간","대학교 캠퍼스"], tags:["공부","학습","문화생활"], types:["culture"] },
  beauty:   { names:["올리브영/드럭스토어","백화점","편집샵/셀렉트샵","온천/스파"], tags:["뷰티","쇼핑","셀프케어"], types:["shopping"] },
  move:     { names:["드라이브 코스","번화가","핫플","짧게 걷기 좋은 동네"], tags:["드라이브","산책"], types:["drive","walk"] },
  relax:    { names:["온천/스파","찜질방/사우나","24시 찜질방","호캉스","조용한 카페"], tags:["힐링","이완","편안함"], types:["relax","cafe"] },
  pet:      { names:["반려동물 카페","애견동반 카페","공원/하천","한강공원"], tags:["반려동물","애견"], types:["cafe","nature"] },
  mountain: { names:["둘레길/산책로","수목원/식물원","제주 올레길","사찰/절"], tags:["등산","산책","자연"], types:["nature","outdoor","walk"] },
  fitness:  { names:["한강공원","공원/하천","해변/강변","둘레길/산책로"], tags:["운동","자전거","조깅"], types:["nature","outdoor"] },
  cycling:  { names:["한강공원","해안도로","드라이브 코스","공원/하천"], tags:["자전거","라이딩"], types:["nature","outdoor","drive"] },
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
      // 활동 장르 → 어울리는 장소 강력 보너스/페널티
      const genreMap = GENRE_PLACE_MAP[ctx.activity.genre];
      if (genreMap) {
        const nameMatch = genreMap.names?.some(n => p.name?.includes(n));
        const tagMatch = genreMap.tags?.some(t => p.tags?.includes(t));
        const typeMatch = genreMap.types?.some(t => p.type?.includes(t));
        if (nameMatch) score += 8;
        else if (tagMatch || typeMatch) score += 5;
        else score -= 3; // 장르와 관련 없는 장소 페널티
      }
    }
    if (ctx?.from === "whatToEat") {
      // 음식 관련 장소 강력 보너스
      const foodPlaceNames = ["맛집 탐방","고깃집","분식집","회전초밥","찜닭골목","포장마차/야시장",
        "푸드코트","한강 치맥","오션뷰 맛집","전통시장","브런치 카페","편의점 앞 벤치"];
      const foodTags = ["맛집","먹방","먹거리","카페","브런치","디저트","길거리음식","먹자골목"];
      const foodTypes = ["cafe","restaurant","market","bar"];
      const isFoodPlace = foodPlaceNames.some(n => p.name?.includes(n))
        || foodTypes.some(t => p.type?.includes(t))
        || p.tags?.some(t => foodTags.includes(t));
      if (isFoodPlace) score += 12;
      // 음식과 완전 무관한 장소 강력 페널티
      if (!isFoodPlace) score -= 6;
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
    if (ctx?.from === "whatToDo" && ctx.activity) {
      if (ctx.activity.vibe) score += p.vibe.filter(v => ctx.activity.vibe.includes(v)).length * 2;
      const genreMap = GENRE_PLACE_MAP[ctx.activity.genre];
      if (genreMap) {
        const nameMatch = genreMap.names?.some(n => p.name?.includes(n));
        const tagMatch = genreMap.tags?.some(t => p.tags?.includes(t));
        const typeMatch = genreMap.types?.some(t => p.type?.includes(t));
        if (nameMatch) score += 6;
        else if (tagMatch || typeMatch) score += 4;
        else score -= 2;
      }
    }
    if (ctx?.from === "whatToEat") {
      const foodPlaceNames = ["맛집 탐방","고깃집","분식집","회전초밥","찜닭골목","포장마차/야시장",
        "푸드코트","한강 치맥","오션뷰 맛집","전통시장","브런치 카페","편의점 앞 벤치"];
      const foodTags = ["맛집","먹방","먹거리","카페","브런치","디저트","길거리음식","먹자골목"];
      const foodTypes = ["cafe","restaurant","market","bar"];
      const isFoodPlace = foodPlaceNames.some(n => p.name?.includes(n))
        || foodTypes.some(t => p.type?.includes(t))
        || p.tags?.some(t => foodTags.includes(t));
      if (isFoodPlace) score += 8;
      if (!isFoodPlace) score -= 4;
    }
    score += Math.random() * 1;
    return { ...p, score };
  }).sort((a, b) => b.score - a.score);

  const topN = Math.min(bracketSize + 8, scored.length);
  return [...scored.slice(0, topN)].sort(() => Math.random() - 0.5).slice(0, bracketSize);
}

// PLACE_MOOD_VIBES export (혹시 외부에서 필요할 때)
export { PLACE_MOOD_VIBES };
