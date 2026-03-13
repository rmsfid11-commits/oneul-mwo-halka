// 코스 조립 엔진 v2
// goodAfter/goodBefore 방향 수정, role 사용, 식사 흐름 보장, 랜덤 축소

function detectTimeSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function scoreActivity(activity, prefs) {
  const {
    need, alone, location, cost, subs = {},
    preferredVibes = [], blacklistGenres = [],
    weather, timeSlot,
  } = prefs;

  if (blacklistGenres.includes(activity.genre)) return -100;

  const SEASON_MAP = {
    150: [12, 1, 2], 74: [5, 6, 7, 8, 9],
    78: [5, 6, 7, 8, 9], 79: [5, 6, 7, 8, 9],
  };
  const curMonth = new Date().getMonth() + 1;
  if (SEASON_MAP[activity.id] && !SEASON_MAP[activity.id].includes(curMonth)) return -100;

  const slot = timeSlot || detectTimeSlot();
  if (activity.timeSlots && activity.timeSlots.length > 0 && !activity.timeSlots.includes(slot)) return -100;

  let score = 0;
  const tags = activity.tags || {};

  if (need && tags.need?.includes(need)) score += 5;
  if (alone && tags.alone?.includes(alone)) score += 4;
  if (location && tags.location?.includes(location)) score += 4;
  if (cost && tags.cost?.includes(cost)) score += 2;

  const subNeed = subs.need || [];
  if (subNeed.length > 0 && activity.vibe) {
    score += activity.vibe.filter((v) => subNeed.includes(v)).length * 2;
  }

  const aloneSubs = subs.alone || [];
  if (aloneSubs.length > 0 && activity.vibe) {
    score += activity.vibe.filter((v) => aloneSubs.includes(v)).length * 1.5;
  }

  if (preferredVibes.length > 0 && activity.vibe) {
    score += activity.vibe.filter((v) => preferredVibes.includes(v)).length * 1;
  }

  const g = activity.genre;
  if (slot === "morning") {
    if (["nature", "fitness", "cooking"].includes(g)) score += 2;
  } else if (slot === "afternoon") {
    if (["travel", "craft", "sport"].includes(g)) score += 1;
  } else if (slot === "evening") {
    if (["cooking", "social", "culture", "food"].includes(g)) score += 2;
  } else if (slot === "night") {
    if (["healing", "culture", "art", "digital", "relax"].includes(g)) score += 2;
    if (["water", "mountain", "sport"].includes(g)) score -= 3;
  }

  if (weather === "rain" && location === "out") {
    if (tags.location && !tags.location.includes("home")) score -= 2;
  }

  return score;
}

export function getAnchorCandidates(activities, prefs, remainingMinutes) {
  const minAnchorTime = 20;
  const anchorRatio = remainingMinutes >= 360 ? 0.4 : remainingMinutes >= 240 ? 0.5 : 0.6;
  const maxAnchorTime = remainingMinutes * anchorRatio;

  return activities
    .filter((a) => {
      const t = a.duration || a.time || 30;
      return t >= minAnchorTime && t <= maxAnchorTime;
    })
    .map((a) => ({ activity: a, score: scoreActivity(a, prefs) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((c) => c.activity);
}

const SIMILAR_GROUPS = [
  ["culture", "learn", "digital"],
  ["healing", "beauty", "relax"],
  ["sport", "fitness", "cycling", "move", "nature"],
  ["cooking", "food"],
];

function countGroupGenres(plan, genre) {
  const group = SIMILAR_GROUPS.find((g) => g.includes(genre));
  if (!group) return 0;
  return plan.filter((a) => group.includes(a.genre)).length;
}

function getSpace(activity) {
  const loc = activity.tags?.location || [];
  if (loc.includes("home") && !loc.includes("out")) return "indoor";
  if (loc.includes("out") && !loc.includes("home")) return "outdoor";
  return "both";
}

function hasMeal(plan) {
  return plan.some((a) => ["food", "cooking"].includes(a.genre));
}

function hasMove(plan) {
  return plan.some((a) => ["move", "sport", "fitness", "cycling", "nature"].includes(a.genre));
}

export function canFollow(prev, next, usedIds, remainingMinutes, weirdCount = 0, plan = []) {
  if (usedIds.has(next.id)) return false;

  const nextTime = next.duration || next.time || 30;
  if (nextTime > remainingMinutes) return false;
  if (nextTime < 15) return false;

  if (prev.genre === next.genre) return false;

  if (next.rarity === "weird" && weirdCount >= 1) return false;

  if (countGroupGenres(plan, next.genre) >= 2) return false;

  if (next.genre === "tidy" && plan.some((a) => a.genre === "tidy")) return false;

  const indoorOnly = ["beauty", "tidy", "digital"];
  const outdoorOnly = ["camp"];
  const planHasIndoor = plan.some((a) => indoorOnly.includes(a.genre));
  const planHasOutdoor = plan.some((a) => outdoorOnly.includes(a.genre));

  if (planHasIndoor && outdoorOnly.includes(next.genre)) return false;
  if (planHasOutdoor) {
    const campOk = ["camp", "cooking", "food", "nature", "social"];
    if (!campOk.includes(next.genre)) return false;
  }
  if (indoorOnly.includes(next.genre) && planHasOutdoor) return false;

  // 공간 흐름: 실내↔실외 전환 최대 1회
  const nextSpace = getSpace(next);
  if (nextSpace !== "both" && plan.length >= 2) {
    const spaces = plan.map(getSpace).filter((s) => s !== "both");
    if (spaces.length >= 2) {
      const lastSpace = spaces[spaces.length - 1];
      let transitions = 0;
      for (let i = 1; i < spaces.length; i++) {
        if (spaces[i] !== spaces[i - 1]) transitions++;
      }
      if (transitions >= 1 && nextSpace !== lastSpace) return false;
    }
  }

  // 3시간 이상 활동 뒤에는 가벼운 것만
  const longAnchor = plan.find((a) => (a.duration || a.time || 30) >= 180);
  if (longAnchor && plan.length >= 1) {
    const allowedAfterLong = ["food", "cooking", "relax", "healing", "culture", "nature"];
    if (!allowedAfterLong.includes(next.genre)) return false;
  }

  return true;
}

// ── 연결 점수: goodAfter/goodBefore 방향 수정 ──
function connectionScore(prev, next) {
  let score = 0;

  // prev 뒤에 next가 어울리는지 (방향 수정!)
  if (prev.goodAfter && prev.goodAfter.includes(next.genre)) score += 4;
  if (next.goodBefore && next.goodBefore.includes(prev.genre)) score += 4;

  // energy 흐름
  if (prev.energyAfter && next.energyBefore) {
    score += prev.energyAfter.filter((e) => next.energyBefore.includes(e)).length * 2;
  }

  const prevEnergy = prev.tags?.energy || [];
  const nextEnergy = next.tags?.energy || [];
  if (prevEnergy.includes("low") && nextEnergy.includes("low")) score += 1;
  if (prevEnergy.includes("mid") && nextEnergy.includes("mid")) score += 1;
  if (prevEnergy.includes("high") && nextEnergy.includes("low")) score -= 1;

  // vibe 연결성
  if (prev.vibe && next.vibe) {
    score += Math.min(prev.vibe.filter((v) => next.vibe.includes(v)).length, 2);
  }

  // 준비 활동이 실행 뒤에 오면 감점
  const prepKeywords = ["계획", "준비", "리스트", "세팅"];
  const nextIsPrep = prepKeywords.some((k) => next.name?.includes(k));
  const prevIsAction = !prepKeywords.some((k) => prev.name?.includes(k));
  if (nextIsPrep && prevIsAction && prev.genre === next.genre) score -= 5;

  return score;
}

// ── role 기반 다음 역할 결정 ──
function getRoleTargets(plan, remainingMinutes, maxActivitiesPerCourse) {
  if (plan.length === 1) return ["filler"];
  if (remainingMinutes <= 60 || plan.length >= maxActivitiesPerCourse - 1) return ["closing"];
  return ["filler", "closing"];
}

// ── 다음 활동 선택: role 사용 + 랜덤 축소 + 중복 감점 ──
export function pickNextActivity(
  allActivities, prev, prefs, usedIds, remainingMinutes,
  allowedRoles, weirdCount = 0, plan = [], globalUsedIds = new Set()
) {
  const candidates = allActivities
    .filter((a) => canFollow(prev, a, usedIds, remainingMinutes, weirdCount, plan))
    .map((a) => {
      const base = scoreActivity(a, prefs);
      const conn = connectionScore(prev, a);

      // role 보너스: 역할 매칭 시 +3
      let roleBonus = 0;
      if (allowedRoles && allowedRoles.length > 0 && a.role) {
        if (a.role.some((r) => allowedRoles.includes(r))) roleBonus += 3;
      }

      // weird 보너스 (filler일 때만)
      let rarityBonus = 0;
      if (a.rarity === "weird" && weirdCount === 0 && allowedRoles?.includes("filler")) {
        rarityBonus += 1;
      }

      // 코스 간 중복: 완전 차단 대신 감점
      const reusedPenalty = globalUsedIds.has(a.id) ? 3 : 0;

      // 랜덤 축소: 1.5 → 0.3
      return {
        activity: a,
        totalScore: base + conn + roleBonus + rarityBonus - reusedPenalty + Math.random() * 0.3,
      };
    })
    .filter((c) => c.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  return candidates[0]?.activity || null;
}

// ── 긴 코스에 식사 흐름 자동 삽입 ──
function injectMealIfNeeded(plan, activities, prefs, usedIds, remainingMinutes) {
  const total = plan.reduce((sum, a) => sum + (a.duration || a.time || 30), 0);
  if (total < 120) return plan; // 2시간 미만이면 패스
  if (hasMeal(plan)) return plan; // 이미 식사 있으면 패스

  const meal = activities
    .filter((a) => !usedIds.has(a.id))
    .filter((a) => ["food", "cooking"].includes(a.genre))
    .filter((a) => (a.duration || a.time || 30) <= remainingMinutes + 20)
    .map((a) => ({ activity: a, score: scoreActivity(a, prefs) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.activity;

  if (!meal) return plan;

  // 마지막 전에 삽입
  if (plan.length >= 2) {
    return [...plan.slice(0, -1), meal, plan[plan.length - 1]];
  }
  return [...plan, meal];
}

// ── 코스 제목 생성 ──
export function generatePlanTitle(plan, prefs, courseIndex = 0) {
  const genres = plan.map((a) => a.genre);
  const hasGenre = (g) => genres.includes(g);
  const isHome = prefs.location === "home";
  const need = prefs.need;
  const first = plan[0];
  const pick = (arr) => arr[courseIndex % arr.length];

  if (hasGenre("water") && plan.some((a) => a.name?.includes("낚시"))) {
    return pick(["물 위에서 여유 부리는 코스", `${first.name}부터 시작하는 물멍 코스`, "낚시하고 느긋하게 마무리"]);
  }
  if (hasGenre("water")) {
    return pick(["물놀이하고 개운하게 마무리", `${first.name}(으)로 시작하는 물놀이 코스`, "시원하게 놀고 쉬는 코스"]);
  }
  if (hasGenre("mountain")) {
    return pick(["땀 좀 흘리고 산 공기 마시기", `${first.name}부터 시작하는 야외 코스`, "산에서 내려와서 쉬는 코스"]);
  }
  if (hasGenre("camp")) {
    return pick(["자연 속에서 느긋하게", `${first.name}(으)로 시작하는 캠핑 코스`, "밖에서 느리게 보내는 하루"]);
  }
  if (hasGenre("pet")) {
    return pick(["우리 강아지랑 함께하는 코스", `${first.name}부터 시작하는 댕댕이 코스`, "강아지랑 같이 보내는 하루"]);
  }
  if (hasGenre("fitness") || hasGenre("sport") || hasGenre("move") || hasGenre("cycling")) {
    return pick(["몸 좀 쓰고 개운하게 마무리", `${first.name}부터 시작하는 활동 코스`, "움직이고 리프레시하는 코스"]);
  }
  if (plan.some((a) => a.name?.includes("카페")) && hasMove(plan)) {
    return pick(["잔잔하게 바깥 공기까지 챙기기", "카페 한 잔 하고 산책까지", "느긋하게 걷고 쉬는 코스"]);
  }
  if (isHome || genres.every((g) => ["healing", "culture", "art", "digital", "cooking", "tidy", "beauty", "relax"].includes(g))) {
    if (hasGenre("tidy")) return pick(["소소하게 정리하면서 보내기", `${first.name}부터 시작하는 정리 코스`, "깔끔하게 정리하고 쉬는 코스"]);
    if (hasGenre("beauty") || hasGenre("relax")) return pick(["나를 위해 가꾸고 쉬기", `${first.name}부터 시작하는 힐링 코스`, "오늘은 나한테 잘해주는 날"]);
    if (hasGenre("cooking")) return pick(["집에서 먹고 쉬는 코스", `${first.name}부터 시작하는 집콕 코스`, "맛있는 거 만들고 느긋하게"]);
    if (need === "멍때리기") return pick(["아무것도 안 하면서 쉬어가기", "그냥 뒹굴거리는 코스", "오늘은 누워있는 게 정답"]);
    return pick(["무리 없이 집에서 보내기", `${first.name}(으)로 시작하는 집콕 코스`, "집 안에서 알차게 보내는 코스"]);
  }
  if (hasGenre("cooking") || hasGenre("food")) {
    return pick(["먹고 즐기고 쉬는 풀코스", `${first.name}부터 시작하는 맛있는 코스`, "오늘은 맛있는 걸로 채우기"]);
  }
  if (hasGenre("nature") || hasGenre("travel")) {
    return pick(["바깥 공기 마시며 리프레시", `${first.name}부터 시작하는 외출 코스`, "나가서 기분 전환하는 코스"]);
  }
  if (hasGenre("art") || hasGenre("craft") || plan.some((a) => a.vibe?.includes("감성충전"))) {
    return pick(["감성 흐름으로 이어지는 코스", `${first.name}부터 시작하는 감성 코스`, "감각적으로 채우는 하루"]);
  }
  if (hasGenre("culture") || hasGenre("learn")) {
    return pick(["머리도 쓰고 즐기기도 하는 코스", `${first.name}부터 시작하는 충전 코스`, "재밌는 거 보고 생각하는 코스"]);
  }
  if (hasGenre("social")) {
    return pick(["사람 만나고 놀면서 푸는 코스", `${first.name}부터 시작하는 놀기 코스`, "같이 놀고 풀어지는 코스"]);
  }

  const needTitles = {
    "힐링": ["오늘은 나를 위해 쉬어가기", "편하게 쉬는 게 정답인 날", "천천히 쉬어가는 코스"],
    "성취감": ["뭔가 해낸 느낌으로 마무리", "오늘 좀 뿌듯하게 끝내는 코스", "작지만 확실한 성취 코스"],
    "자극": ["좀 색다르게 움직여보는 코스", "오늘은 좀 다르게 보내기", "새로운 자극 충전 코스"],
    "멍때리기": ["그냥 흘러가는 대로 보내기", "오늘은 아무것도 안 해도 돼", "멍때리기 전문 코스"],
  };
  if (need && needTitles[need]) return pick(needTitles[need]);

  return pick([`${first.name}(으)로 시작하는 코스`, "오늘 이렇게 보내봐", "이런 흐름 어때?"]);
}

// ── 코스 이유 생성: 흐름 설명 포함 ──
export function generatePlanReason(plan) {
  if (!plan || plan.length === 0) return "";

  const totalMinutes = plan.reduce((sum, a) => sum + (a.duration || a.time || 30), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeText = hours > 0 ? `${hours}시간${mins > 0 ? ` ${mins}분` : ""}` : `${mins}분`;

  if (plan.length === 1) {
    return `${plan[0].emoji} ${plan[0].name} 하나면 ${timeText} 금방이야.`;
  }

  const first = plan[0];
  const last = plan[plan.length - 1];
  const move = hasMove(plan);
  const meal = hasMeal(plan);

  let middle = "중간에 무리 없이 흐름이 이어지고";
  if (move && meal) middle = "중간에 바깥 공기랑 먹는 흐름까지 자연스럽게 이어지고";
  else if (move) middle = "중간에 가볍게 움직이면서 리듬을 바꿀 수 있고";
  else if (meal) middle = "중간에 먹는 흐름까지 자연스럽게 들어가고";

  return `${first.emoji} ${first.name}로 시작해서 ${middle} 마지막엔 ${last.emoji} ${last.name}(으)로 마무리하는 약 ${timeText} 코스야.`;
}

// ── 코스 중복 제거 ──
function dedupePlans(plans) {
  const result = [];
  for (const plan of plans) {
    const ids = new Set(plan.map((a) => a.id));
    const isDup = result.some((existing) => {
      const existIds = new Set(existing.map((a) => a.id));
      const overlap = [...ids].filter((id) => existIds.has(id)).length;
      const minLen = Math.min(ids.size, existIds.size);
      return overlap >= Math.ceil(minLen * 0.5);
    });
    if (!isDup) result.push(plan);
  }
  return result;
}

// ── 메인: 코스 3개 조립 ──
export function buildCoursePlans(activities, prefs, championId) {
  const totalMinutes = (prefs.hours || 2) * 60;
  const maxActivitiesPerCourse =
    totalMinutes >= 360 ? 6 : totalMinutes >= 240 ? 5 : totalMinutes >= 180 ? 4 : 4;

  const champion = championId ? activities.find((a) => a.id === championId) : null;

  let anchors = getAnchorCandidates(activities, prefs, totalMinutes);

  if (champion && !anchors.find((a) => a.id === champion.id)) {
    anchors = [champion, ...anchors];
  } else if (champion) {
    anchors = [champion, ...anchors.filter((a) => a.id !== champion.id)];
  }

  if (anchors.length === 0) {
    const fallback = activities
      .map((a) => ({ a, s: scoreActivity(a, prefs) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => [x.a]);

    return fallback.map((plan, idx) => ({
      activities: plan,
      title: generatePlanTitle(plan, prefs, idx),
      reason: generatePlanReason(plan),
      totalMinutes: plan.reduce((s, a) => s + (a.duration || a.time || 30), 0),
    }));
  }

  // anchor 다양성
  const selectedAnchors = [];
  const usedGenres = new Set();
  for (const a of anchors) {
    if (selectedAnchors.length >= 5) break;
    if (!usedGenres.has(a.genre)) {
      selectedAnchors.push(a);
      usedGenres.add(a.genre);
    }
  }
  for (const a of anchors) {
    if (selectedAnchors.length >= 5) break;
    if (!selectedAnchors.find((s) => s.id === a.id)) {
      selectedAnchors.push(a);
    }
  }

  const rawPlans = [];
  const globalUsedIds = new Set();

  for (const anchor of selectedAnchors) {
    let plan = [anchor];
    const usedIds = new Set([anchor.id]);
    let remaining = totalMinutes - (anchor.duration || anchor.time || 30);
    let weirdCount = anchor.rarity === "weird" ? 1 : 0;

    while (plan.length < maxActivitiesPerCourse && remaining >= 15) {
      const prev = plan[plan.length - 1];
      const allowedRoles = getRoleTargets(plan, remaining, maxActivitiesPerCourse);

      const next = pickNextActivity(
        activities, prev, prefs, usedIds, remaining,
        allowedRoles, weirdCount, plan, globalUsedIds
      );

      if (!next) break;
      plan.push(next);
      usedIds.add(next.id);
      remaining -= next.duration || next.time || 30;
      if (next.rarity === "weird") weirdCount++;
    }

    // 긴 코스에 식사 자동 삽입
    plan = injectMealIfNeeded(plan, activities, prefs, usedIds, remaining);

    rawPlans.push(plan);
    plan.forEach((a) => globalUsedIds.add(a.id));
  }

  const uniquePlans = dedupePlans(rawPlans);

  return uniquePlans.slice(0, 3).map((plan, idx) => ({
    activities: plan,
    title: generatePlanTitle(plan, prefs, idx),
    reason: generatePlanReason(plan),
    totalMinutes: plan.reduce((sum, a) => sum + (a.duration || a.time || 30), 0),
  }));
}
