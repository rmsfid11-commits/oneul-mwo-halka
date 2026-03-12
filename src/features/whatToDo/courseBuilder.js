// 코스 조립 엔진
// 사용자 선호도(prefs)와 활동 데이터를 기반으로 2~4개 활동으로 구성된 코스 3개를 조립

// ── 시간대 자동 감지 ──
function detectTimeSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

// ── 활동 점수 계산 ──
export function scoreActivity(activity, prefs) {
  const {
    need, alone, location, cost, subs = {},
    preferredVibes = [], blacklistGenres = [],
    weather, timeSlot,
  } = prefs;

  // 블랙리스트 장르면 -100 (사실상 제외)
  if (blacklistGenres.includes(activity.genre)) return -100;

  // 계절 필터: 계절에 안 맞는 활동 제외
  const SEASON_MAP = { 150:[12,1,2], 74:[5,6,7,8,9], 78:[5,6,7,8,9], 79:[5,6,7,8,9] };
  const curMonth = new Date().getMonth() + 1;
  if (SEASON_MAP[activity.id] && !SEASON_MAP[activity.id].includes(curMonth)) return -100;

  // 시간대 하드 필터: timeSlots가 있으면 현재 시간대에 맞아야 함
  const slot = timeSlot || detectTimeSlot();
  if (activity.timeSlots && activity.timeSlots.length > 0 && !activity.timeSlots.includes(slot)) return -100;

  let score = 0;
  const tags = activity.tags || {};

  // 기본 매칭: need, alone, location, cost (tags 기반)
  if (need && tags.need && tags.need.includes(need)) score += 5;
  if (alone && tags.alone && tags.alone.includes(alone)) score += 4;
  if (location && tags.location && tags.location.includes(location)) score += 4;
  if (cost && tags.cost && tags.cost.includes(cost)) score += 2;

  // subs 세부 매칭 (need의 하위 선택)
  const subVibes = subs.need || [];
  if (subVibes.length > 0 && activity.vibe) {
    const overlap = activity.vibe.filter((v) => subVibes.includes(v)).length;
    score += overlap * 2;
  }

  // alone 하위 subs
  const aloneSubs = subs.alone || [];
  if (aloneSubs.length > 0 && activity.vibe) {
    const overlap = activity.vibe.filter((v) => aloneSubs.includes(v)).length;
    score += overlap * 1.5;
  }

  // preferredVibes (학습된 vibe) 보너스
  if (preferredVibes.length > 0 && activity.vibe) {
    const overlap = activity.vibe.filter((v) => preferredVibes.includes(v)).length;
    score += overlap * 1;
  }

  // 시간대 보너스
  const g = activity.genre;
  if (slot === "morning") {
    if (["nature", "fitness", "cooking"].includes(g)) score += 2;
  } else if (slot === "afternoon") {
    if (["travel", "craft", "sport"].includes(g)) score += 1;
  } else if (slot === "evening") {
    if (["cooking", "social", "culture"].includes(g)) score += 2;
  } else if (slot === "night") {
    if (["healing", "culture", "art"].includes(g)) score += 2;
    if (["water", "mountain", "sport"].includes(g)) score -= 3;
  }

  // 날씨 보너스 (optional)
  if (weather === "rain" && location === "out") {
    // 비 올 때 야외 활동은 약간 감점
    if (tags.location && !tags.location.includes("home")) score -= 1;
  }

  return score;
}

// ── anchor 후보 추출 ──
// 코스의 핵심 활동 = anchor. 시간이 충분하고 점수가 높은 활동
export function getAnchorCandidates(activities, prefs, remainingMinutes) {
  const minAnchorTime = 20;
  // 시간이 길면 앵커 비율 여유 있게 (6시간+ → 40%, 4시간 → 50%, 2시간 → 60%)
  const anchorRatio = remainingMinutes >= 360 ? 0.4 : remainingMinutes >= 240 ? 0.5 : 0.6;
  const maxAnchorTime = remainingMinutes * anchorRatio;

  const candidates = activities
    .filter((a) => {
      const t = a.duration || a.time || 30;
      return t >= minAnchorTime && t <= maxAnchorTime;
    })
    .map((a) => ({ activity: a, score: scoreActivity(a, prefs) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  // 상위 6개 반환
  return candidates.slice(0, 6).map((c) => c.activity);
}

// ── 유사 장르 그룹 (같은 그룹 내 장르가 코스에 과다하면 지루함) ──
const SIMILAR_GROUPS = [
  ["culture", "learn", "digital"],     // 수동 소비 (화면/읽기)
  ["healing", "beauty", "relax"],      // 힐링/자기관리
  ["sport", "fitness", "cycling", "move"], // 운동/활동
  ["cooking", "food"],                 // 음식 관련
];

function countGroupGenres(plan, genre) {
  const group = SIMILAR_GROUPS.find((g) => g.includes(genre));
  if (!group) return 0;
  return plan.filter((a) => group.includes(a.genre)).length;
}

// ── 연결 호환성 체크 ──
export function canFollow(prev, next, usedIds, remainingMinutes, weirdCount = 0, plan = []) {
  // 중복 방지
  if (usedIds.has(next.id)) return false;

  // 시간 체크
  const nextTime = next.duration || next.time || 30;
  if (nextTime > remainingMinutes) return false;

  // 최소 15분
  if (nextTime < 15) return false;

  // 같은 장르 연속 피하기
  if (prev.genre === next.genre) return false;

  // weird 활동은 코스당 최대 1개
  if (next.rarity === "weird" && weirdCount >= 1) return false;

  // 유사 장르 과다 방지: 같은 그룹에서 2개 이상이면 차단
  if (countGroupGenres(plan, next.genre) >= 2) return false;

  // tidy 과다 방지: 정리/청소는 최대 1개
  if (next.genre === "tidy" && plan.some((a) => a.genre === "tidy")) return false;

  // 실내/자기관리 ↔ 캠핑/야외 코스 혼합 방지 (양방향)
  const indoorOnly = ["beauty", "tidy", "digital"];
  const outdoorOnly = ["camp"];
  const planHasIndoor = plan.some((a) => indoorOnly.includes(a.genre));
  const planHasOutdoor = plan.some((a) => outdoorOnly.includes(a.genre));
  if (planHasIndoor && outdoorOnly.includes(next.genre)) return false;
  if (planHasOutdoor) {
    const campOk = ["camp", "cooking", "food", "nature", "social"];
    if (!campOk.includes(next.genre)) return false;
  }
  // 반대도: 캠핑 다음에 실내 자기관리 안 됨
  if (indoorOnly.includes(next.genre) && plan.some((a) => outdoorOnly.includes(a.genre))) return false;

  // 장시간 활동(4시간+) 뒤에는 최대 1개 추가만
  if (plan.some((a) => (a.duration || a.time || 30) >= 240) && plan.length >= 2) return false;

  return true;
}

// ── 연결 점수 계산 (goodAfter/goodBefore, energy 흐름) ──
function connectionScore(prev, next) {
  let score = 0;

  // goodAfter 연결: prev 뒤에 next.genre가 잘 어울리는지
  if (next.goodAfter && next.goodAfter.includes(prev.genre)) score += 3;
  if (prev.goodBefore && prev.goodBefore.includes(next.genre)) score += 3;

  // energy 흐름: prev의 energyAfter → next의 energyBefore 매칭
  if (prev.energyAfter && next.energyBefore) {
    const overlap = prev.energyAfter.filter((e) =>
      next.energyBefore.includes(e)
    ).length;
    score += overlap * 2;
  }

  // tags.energy 기반 흐름 (기존 데이터의 tags.energy 활용)
  const prevEnergy = prev.tags?.energy || [];
  const nextEnergy = next.tags?.energy || [];
  // 에너지 레벨이 부드럽게 이어지면 보너스
  if (prevEnergy.includes("low") && nextEnergy.includes("low")) score += 1;
  if (prevEnergy.includes("mid") && nextEnergy.includes("mid")) score += 1;
  if (prevEnergy.includes("high") && nextEnergy.includes("low")) score -= 1; // 급격한 다운은 약간 감점

  // vibe 연결성: 공통 vibe가 있으면 자연스러운 흐름
  if (prev.vibe && next.vibe) {
    const commonVibes = prev.vibe.filter((v) => next.vibe.includes(v)).length;
    score += Math.min(commonVibes, 2); // 최대 +2
  }

  // 계획/준비 활동이 실행 활동 뒤에 오면 감점 (순서가 반대)
  const prepKeywords = ["계획", "준비", "리스트", "세팅"];
  const nextIsPrep = prepKeywords.some((k) => next.name?.includes(k));
  const prevIsAction = !prepKeywords.some((k) => prev.name?.includes(k));
  if (nextIsPrep && prevIsAction && prev.genre === next.genre) score -= 5;

  return score;
}

// ── 다음 활동 선택 ──
export function pickNextActivity(
  allActivities,
  prev,
  prefs,
  usedIds,
  remainingMinutes,
  allowedRoles,
  weirdCount = 0,
  plan = []
) {
  const candidates = allActivities
    .filter((a) => canFollow(prev, a, usedIds, remainingMinutes, weirdCount, plan))
    .map((a) => {
      const base = scoreActivity(a, prefs);
      const conn = connectionScore(prev, a);
      // role 필터: allowedRoles가 있으면 매칭하는 활동에 보너스
      let roleBonus = 0;
      if (allowedRoles && allowedRoles.length > 0 && a.role) {
        if (a.role.some((r) => allowedRoles.includes(r))) roleBonus += 2;
      }
      // weird 활동은 filler로 쓰일 때 약간 보너스 (의외성 재미)
      let rarityBonus = 0;
      if (a.rarity === "weird" && weirdCount === 0) rarityBonus += 1.5;
      return {
        activity: a,
        totalScore: base + conn + roleBonus + rarityBonus + Math.random() * 1.5,
      };
    })
    .filter((c) => c.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  return candidates[0]?.activity || null;
}

// ── 코스 제목 생성 (코스마다 다른 제목) ──
export function generatePlanTitle(plan, prefs, courseIndex = 0) {
  const genres = plan.map((a) => a.genre);
  const hasGenre = (g) => genres.includes(g);
  const isHome = prefs.location === "home";
  const need = prefs.need;
  const first = plan[0];
  const pick = (arr) => arr[courseIndex % arr.length]; // 코스별로 다른 제목

  // 낚시
  if (hasGenre("water") && plan.some((a) => a.name?.includes("낚시"))) {
    return pick(["물 위에서 여유 부리는 코스", `${first.name}부터 시작하는 물멍 코스`, "낚시하고 느긋하게 마무리"]);
  }
  // 수상
  if (hasGenre("water")) {
    return pick(["물놀이하고 개운하게 마무리", `${first.name}(으)로 시작하는 물놀이 코스`, "시원하게 놀고 쉬는 코스"]);
  }
  // 등산
  if (hasGenre("mountain")) {
    return pick(["땀 좀 흘리고 산 공기 마시기", `${first.name}부터 시작하는 야외 코스`, "산에서 내려와서 쉬는 코스"]);
  }
  // 캠핑
  if (hasGenre("camp")) {
    return pick(["자연 속에서 느긋하게", `${first.name}(으)로 시작하는 캠핑 코스`, "밖에서 느리게 보내는 하루"]);
  }
  // 반려견
  if (hasGenre("pet")) {
    return pick(["우리 강아지랑 함께하는 코스", `${first.name}부터 시작하는 댕댕이 코스`, "강아지랑 같이 보내는 하루"]);
  }
  // 운동
  if (hasGenre("fitness") || hasGenre("sport") || hasGenre("move") || hasGenre("cycling")) {
    return pick(["몸 좀 쓰고 개운하게 마무리", `${first.name}부터 시작하는 활동 코스`, "움직이고 리프레시하는 코스"]);
  }
  // 카페 + 산책
  if (plan.some((a) => a.name?.includes("카페")) && plan.some((a) => a.name?.includes("산책") || a.genre === "nature")) {
    return pick(["잔잔하게 바깥 공기까지 챙기기", "카페 한 잔 하고 산책까지", "느긋하게 걷고 쉬는 코스"]);
  }
  // 집 위주
  if (isHome || genres.every((g) => ["healing", "culture", "art", "digital", "cooking", "tidy", "beauty", "relax"].includes(g))) {
    if (hasGenre("tidy")) return pick(["소소하게 정리하면서 보내기", `${first.name}부터 시작하는 정리 코스`, "깔끔하게 정리하고 쉬는 코스"]);
    if (hasGenre("beauty") || hasGenre("relax")) return pick(["나를 위해 가꾸고 쉬기", `${first.name}부터 시작하는 힐링 코스`, "오늘은 나한테 잘해주는 날"]);
    if (hasGenre("cooking")) return pick(["집에서 먹고 쉬는 코스", `${first.name}부터 시작하는 집콕 코스`, "맛있는 거 만들고 느긋하게"]);
    if (need === "멍때리기") return pick(["아무것도 안 하면서 쉬어가기", "그냥 뒹굴거리는 코스", "오늘은 누워있는 게 정답"]);
    return pick(["무리 없이 집에서 보내기", `${first.name}(으)로 시작하는 집콕 코스`, "집 안에서 알차게 보내는 코스"]);
  }
  // 먹기
  if (hasGenre("cooking") || hasGenre("food")) {
    return pick(["먹고 즐기고 쉬는 풀코스", `${first.name}부터 시작하는 맛있는 코스`, "오늘은 맛있는 걸로 채우기"]);
  }
  // 자연/여행
  if (hasGenre("nature") || hasGenre("travel")) {
    return pick(["바깥 공기 마시며 리프레시", `${first.name}부터 시작하는 외출 코스`, "나가서 기분 전환하는 코스"]);
  }
  // 감성
  if (hasGenre("art") || hasGenre("craft") || plan.some((a) => a.vibe?.includes("감성충전"))) {
    return pick(["감성 흐름으로 이어지는 코스", `${first.name}부터 시작하는 감성 코스`, "감각적으로 채우는 하루"]);
  }
  // 문화
  if (hasGenre("culture") || hasGenre("learn")) {
    return pick(["머리도 쓰고 즐기기도 하는 코스", `${first.name}부터 시작하는 충전 코스`, "재밌는 거 보고 생각하는 코스"]);
  }
  // 사교
  if (hasGenre("social")) {
    return pick(["사람 만나고 놀면서 푸는 코스", `${first.name}부터 시작하는 놀기 코스`, "같이 놀고 풀어지는 코스"]);
  }
  // need 기반 fallback
  const needTitles = {
    "힐링": ["오늘은 나를 위해 쉬어가기", "편하게 쉬는 게 정답인 날", "천천히 쉬어가는 코스"],
    "성취감": ["뭔가 해낸 느낌으로 마무리", "오늘 좀 뿌듯하게 끝내는 코스", "작지만 확실한 성취 코스"],
    "자극": ["좀 색다르게 움직여보는 코스", "오늘은 좀 다르게 보내기", "새로운 자극 충전 코스"],
    "멍때리기": ["그냥 흘러가는 대로 보내기", "오늘은 아무것도 안 해도 돼", "멍때리기 전문 코스"],
  };
  if (need && needTitles[need]) return pick(needTitles[need]);

  // 최종 fallback
  return pick([`${first.name}(으)로 시작하는 코스`, "오늘 이렇게 보내봐", "이런 흐름 어때?"]);
}

// ── 코스 추천 이유 생성 (가벼운 톤) ──
export function generatePlanReason(plan, prefs) {
  if (!plan || plan.length === 0) return "";

  const first = plan[0];
  const last = plan[plan.length - 1];
  const totalMinutes = plan.reduce((sum, a) => sum + (a.duration || a.time || 30), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeText = hours > 0 ? `${hours}시간${mins > 0 ? ` ${mins}분` : ""}` : `${mins}분`;

  if (plan.length === 1) {
    return `${first.emoji} ${first.name} 하나면 ${timeText} 금방이야.`;
  }

  // 짧은 설명: 첫 활동 → 마지막 활동, 시간
  return `${first.emoji} ${first.name}에서 시작해서 ${last.emoji} ${last.name}까지, 약 ${timeText} 코스야.`;
}

// ── 코스 중복 제거 (50% 이상 겹치면 제거) ──
function dedupePlans(plans) {
  const result = [];
  for (const plan of plans) {
    const ids = new Set(plan.map((a) => a.id));
    const isDup = result.some((existing) => {
      const existIds = new Set(existing.map((a) => a.id));
      const overlap = [...ids].filter((id) => existIds.has(id)).length;
      const minLen = Math.min(ids.size, existIds.size);
      return overlap >= Math.ceil(minLen * 0.5); // 50% 이상 겹치면 중복
    });
    if (!isDup) result.push(plan);
  }
  return result;
}

// ── 메인 함수: 코스 3개 조립 ──
// championId: 토너먼트 우승자 ID (있으면 첫 번째 코스에 강제 포함)
export function buildCoursePlans(activities, prefs, championId) {
  const totalMinutes = (prefs.hours || 2) * 60;
  // 시간 예산에 따라 활동 수 조절 (긴 시간이면 더 많은 활동)
  const maxActivitiesPerCourse = totalMinutes >= 360 ? 7 : totalMinutes >= 240 ? 6 : totalMinutes >= 180 ? 5 : 4;

  // 챔피언 활동 찾기
  const champion = championId ? activities.find((a) => a.id === championId) : null;

  // anchor 후보 최대 6개
  let anchors = getAnchorCandidates(activities, prefs, totalMinutes);

  // 챔피언이 anchor 후보에 없으면 강제 추가 (맨 앞)
  if (champion && !anchors.find((a) => a.id === champion.id)) {
    anchors = [champion, ...anchors];
  } else if (champion) {
    // 이미 있으면 맨 앞으로 이동
    anchors = [champion, ...anchors.filter((a) => a.id !== champion.id)];
  }

  if (anchors.length === 0) {
    // anchor 없으면 점수 높은 활동 단독 코스로 대체
    const fallback = activities
      .map((a) => ({ a, s: scoreActivity(a, prefs) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => [x.a]);
    return fallback.map((plan, idx) => ({
      activities: plan,
      title: generatePlanTitle(plan, prefs, idx),
      reason: generatePlanReason(plan, prefs),
      totalMinutes: plan.reduce((s, a) => s + (a.duration || a.time || 30), 0),
    }));
  }

  // anchor 다양성: 같은 장르 anchor 연속 방지
  const selectedAnchors = [];
  const usedGenres = new Set();
  // 1순위: 장르가 다른 anchor들
  for (const a of anchors) {
    if (selectedAnchors.length >= 5) break;
    if (!usedGenres.has(a.genre)) {
      selectedAnchors.push(a);
      usedGenres.add(a.genre);
    }
  }
  // 부족하면 장르 중복이라도 추가
  for (const a of anchors) {
    if (selectedAnchors.length >= 5) break;
    if (!selectedAnchors.find((s) => s.id === a.id)) {
      selectedAnchors.push(a);
    }
  }

  const rawPlans = [];
  // 코스 간 활동 중복 방지: 이전 코스에서 쓴 활동 ID 추적
  const globalUsedIds = new Set();

  for (const anchor of selectedAnchors) {
    const plan = [anchor];
    // 해당 코스 내 중복 방지 + 이전 코스 활동 회피
    const usedIds = new Set([anchor.id, ...globalUsedIds]);
    let remaining = totalMinutes - (anchor.duration || anchor.time || 30);
    let weirdCount = anchor.rarity === "weird" ? 1 : 0;

    // anchor 뒤에 활동 추가
    while (plan.length < maxActivitiesPerCourse && remaining >= 15) {
      const prev = plan[plan.length - 1];
      const next = pickNextActivity(
        activities,
        prev,
        prefs,
        usedIds,
        remaining,
        null,
        weirdCount,
        plan
      );
      if (!next) break;

      plan.push(next);
      usedIds.add(next.id);
      remaining -= next.duration || next.time || 30;
      if (next.rarity === "weird") weirdCount++;
    }

    rawPlans.push(plan);
    // 이 코스의 활동들을 글로벌에 등록 → 다음 코스에서 회피
    plan.forEach((a) => globalUsedIds.add(a.id));
  }

  // 중복 제거
  const uniquePlans = dedupePlans(rawPlans);

  // 결과 조립
  return uniquePlans.slice(0, 3).map((plan, idx) => ({
    activities: plan,
    title: generatePlanTitle(plan, prefs, idx),
    reason: generatePlanReason(plan, prefs),
    totalMinutes: plan.reduce(
      (sum, a) => sum + (a.duration || a.time || 30),
      0
    ),
  }));
}
