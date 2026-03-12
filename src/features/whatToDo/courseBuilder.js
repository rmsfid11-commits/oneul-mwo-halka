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
  const maxAnchorTime = remainingMinutes * 0.6; // 전체 시간의 60% 이하

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

// ── 연결 호환성 체크 ──
export function canFollow(prev, next, usedIds, remainingMinutes, weirdCount = 0) {
  // 중복 방지
  if (usedIds.has(next.id)) return false;

  // 시간 체크
  const nextTime = next.duration || next.time || 30;
  if (nextTime > remainingMinutes) return false;

  // 최소 15분
  if (nextTime < 15) return false;

  // 같은 장르 연속 피하기 (완전 동일 장르)
  if (prev.genre === next.genre) return false;

  // weird 활동은 코스당 최대 1개 (의외성은 1개여야 빛남)
  if (next.rarity === "weird" && weirdCount >= 1) return false;

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
  weirdCount = 0
) {
  const candidates = allActivities
    .filter((a) => canFollow(prev, a, usedIds, remainingMinutes, weirdCount))
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

// ── 코스 제목 생성 ──
export function generatePlanTitle(plan, prefs, courseIndex = 0) {
  const genres = plan.map((a) => a.genre);
  const hasGenre = (g) => genres.includes(g);
  const isHome = prefs.location === "home";
  const need = prefs.need;
  const firstName = plan[0]?.name || "";

  // 낚시 포함
  if (hasGenre("water") && plan.some((a) => a.name?.includes("낚시"))) {
    return "물 위에서 여유 부리는 코스";
  }

  // 수상 스포츠 포함
  if (hasGenre("water")) {
    return "물놀이하고 개운하게 마무리하는 코스";
  }

  // 등산/클라이밍
  if (hasGenre("mountain")) {
    return "땀 좀 흘리고 산 공기 마시는 코스";
  }

  // 캠핑
  if (hasGenre("camp")) {
    return "자연 속에서 느긋하게 보내는 코스";
  }

  // 반려견
  if (hasGenre("pet")) {
    return "우리 강아지랑 함께하는 코스";
  }

  // 운동 포함
  if (hasGenre("fitness") || hasGenre("sport") || hasGenre("move") || hasGenre("cycling")) {
    return "몸 좀 쓰고 개운하게 마무리하는 코스";
  }

  // 카페 + 산책 조합
  if (
    plan.some((a) => a.name?.includes("카페")) &&
    plan.some((a) => a.name?.includes("산책") || a.genre === "nature")
  ) {
    return "잔잔하게 바깥 공기까지 챙기는 코스";
  }

  // 집 위주
  if (isHome || genres.every((g) => ["healing", "culture", "art", "digital", "cooking", "tidy", "beauty", "relax"].includes(g))) {
    if (need === "멍때리기") return "아무것도 안 하면서 쉬어가는 코스";
    if (hasGenre("tidy")) return "소소하게 정리하면서 보내는 코스";
    if (hasGenre("beauty") || hasGenre("relax")) return "나를 위해 가꾸고 쉬는 코스";
    return "무리 없이 집 중심으로 쉬어가는 코스";
  }

  // 먹기 포함
  if (hasGenre("cooking") || hasGenre("food")) {
    return "먹고 즐기고 쉬는 풀코스";
  }

  // 자연 / 여행
  if (hasGenre("nature") || hasGenre("travel")) {
    return "바깥 공기 마시며 리프레시하는 코스";
  }

  // 감성 위주
  if (hasGenre("art") || hasGenre("craft") || plan.some((a) => a.vibe?.includes("감성충전"))) {
    return "감성 흐름으로 이어지는 코스";
  }

  // 문화
  if (hasGenre("culture") || hasGenre("learn")) {
    return "머리도 쓰고 즐기기도 하는 코스";
  }

  // 사교
  if (hasGenre("social")) {
    return "사람 만나고 놀면서 푸는 코스";
  }

  // 기본: need 기반
  if (need === "힐링") return "오늘은 나를 위해 쉬어가는 코스";
  if (need === "성취감") return "뭔가 해낸 느낌으로 마무리하는 코스";
  if (need === "자극") return "좀 색다르게 움직여보는 코스";
  if (need === "멍때리기") return "그냥 흘러가는 대로 보내는 코스";

  // 최종 fallback: 코스별로 다른 제목
  const fallbacks = ["오늘 하루를 채워줄 코스", "이런 흐름도 괜찮을 거야", "가볍게 이렇게 보내봐"];
  return fallbacks[courseIndex % fallbacks.length];
}

// ── 코스 추천 이유 생성 ──
export function generatePlanReason(plan, prefs) {
  if (!plan || plan.length === 0) return "";

  const first = plan[0];
  const totalMinutes = plan.reduce((sum, a) => sum + (a.duration || a.time || 30), 0);
  const need = prefs.need;

  // need에 따른 분위기 표현
  const moodMap = {
    "힐링": "편안한 분위기",
    "성취감": "뿌듯한 느낌",
    "자극": "새로운 자극",
    "멍때리기": "아무 생각 없는 시간",
  };
  const moodText = moodMap[need] || "원하는 분위기";

  if (plan.length === 1) {
    return `${first.emoji} ${first.name}만으로도 ${moodText}를 충분히 느낄 수 있어. 약 ${totalMinutes}분이면 딱이야.`;
  }

  const last = plan[plan.length - 1];
  return `${first.emoji} ${first.name}(으)로 시작하면 지금 원하는 ${moodText}를 자연스럽게 만들 수 있고, ${last.emoji} ${last.name}까지 이어지면서 약 ${totalMinutes}분 정도를 알차게 보낼 수 있어.`;
}

// ── 코스 중복 제거 ──
function dedupePlans(plans) {
  const seen = new Set();
  return plans.filter((plan) => {
    // 각 코스의 활동 ID를 정렬한 키로 중복 체크
    const key = plan
      .map((a) => a.id)
      .sort()
      .join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── 메인 함수: 코스 3개 조립 ──
// championId: 토너먼트 우승자 ID (있으면 첫 번째 코스에 강제 포함)
export function buildCoursePlans(activities, prefs, championId) {
  const totalMinutes = (prefs.hours || 2) * 60;
  const maxActivitiesPerCourse = 4;

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

  // 상위 3개 anchor로 코스 생성 (6개 중에서 최대한 다양하게)
  const selectedAnchors = anchors.slice(0, Math.min(3, anchors.length));
  const rawPlans = [];

  for (const anchor of selectedAnchors) {
    const plan = [anchor];
    const usedIds = new Set([anchor.id]);
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
        weirdCount
      );
      if (!next) break;

      plan.push(next);
      usedIds.add(next.id);
      remaining -= next.duration || next.time || 30;
      if (next.rarity === "weird") weirdCount++;
    }

    rawPlans.push(plan);
  }

  // anchor가 3개 미만이면 추가 시도: 다른 anchor 조합
  if (rawPlans.length < 3 && anchors.length > 3) {
    for (let i = 3; i < anchors.length && rawPlans.length < 3; i++) {
      const anchor = anchors[i];
      const plan = [anchor];
      const usedIds = new Set([anchor.id]);
      let remaining = totalMinutes - (anchor.duration || anchor.time || 30);
      let weirdCount = anchor.rarity === "weird" ? 1 : 0;

      while (plan.length < maxActivitiesPerCourse && remaining >= 15) {
        const prev = plan[plan.length - 1];
        const next = pickNextActivity(
          activities,
          prev,
          prefs,
          usedIds,
          remaining,
          null,
          weirdCount
        );
        if (!next) break;
        plan.push(next);
        usedIds.add(next.id);
        remaining -= next.duration || next.time || 30;
        if (next.rarity === "weird") weirdCount++;
      }

      rawPlans.push(plan);
    }
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
