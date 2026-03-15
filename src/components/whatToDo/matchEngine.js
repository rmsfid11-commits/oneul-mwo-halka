import { SEASONAL_ACTIVITIES, VIBE_KO } from './constants.js';

// ─── 시간대 판별 ────────────────────────────────────────────
export function getTimeSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

// ─── 시간대 보너스 ────────────────────────────────────────────
export function getTimeBonus(act) {
  const h = new Date().getHours();
  const g = act.genre;
  if (h >= 6  && h < 10) {
    if (["nature","fitness","cooking"].includes(g)) return 2;
  }
  if (h >= 18 && h < 21) {
    if (["cooking","social","culture"].includes(g)) return 2;
  }
  if (h >= 21 || h < 2) {
    if (["healing","culture","art"].includes(g)) return 2;
    if (["water","mountain","sport"].includes(g)) return -3;
  }
  return 0;
}

// ─── 활동 가중치 (일정 정렬용) ────────────────────────────────
export function getActivityWeight(act) {
  let w = 0;
  if (act.tags?.energy?.includes("high")) w += 3;
  else if (act.tags?.energy?.includes("mid")) w += 2;
  else w += 1;
  const activeGenres = ["water","mountain","sport","fitness","cycling"];
  if (activeGenres.includes(act.genre)) w += 2;
  if (act.tags.need?.includes("성취감")) w += 1;
  return w;
}

// ─── 카테고리 분류 ────────────────────────────────────────────
export function getCategory(act) {
  if (act.tags.need?.includes("성취감")) return "productive";
  if (act.tags.need?.includes("자극")) return "stimulate";
  if (act.tags.need?.includes("멍때리기")) return "passive";
  return "healing";
}

// ─── 일정 순서 정렬 ────────────────────────────────────────────
export function sortSchedule(items, timeSlot) {
  return [...items].sort((a, b) => {
    const wa = getActivityWeight(a);
    const wb = getActivityWeight(b);
    if (timeSlot === "night") {
      if (a.tags.location.includes("out") && !b.tags.location.includes("out")) return 1;
      if (!a.tags.location.includes("out") && b.tags.location.includes("out")) return -1;
    }
    if (timeSlot === "evening") {
      const foodA = a.genre === "cooking";
      const foodB = b.genre === "cooking";
      if (foodA && !foodB) return -1;
      if (!foodA && foodB) return 1;
    }
    return wb - wa;
  });
}

// ─── 매칭 로직 ────────────────────────────────────────────
export function matchActivities(answers, ACTIVITIES) {
  const allSubs = Object.values(answers.subs || {}).flat();
  const togetherWith = (answers.subs?.alone || [])[0];

  const togetherGenreBonus = {
    친구:  ["social","sport","game","food","travel"],
    연인:  ["culture","travel","nature","food","craft","relax"],
    가족:  ["nature","food","camp","culture","cooking"],
    동료:  ["social","sport","food","game"],
  };

  return ACTIVITIES.map(act => {
    let score = 0;
    const t = act.tags;

    // 하드 필터
    if (answers.location === "home" && !t.location?.includes("home")) return null;
    if (answers.alone === "혼자"    && t.alone?.length === 1 && t.alone[0] === "같이") return null;
    if (answers.alone === "같이"    && t.alone?.length === 1 && (t.alone[0] === "혼자" || t.alone[0] === "강아지랑")) return null;
    if (answers.alone === "강아지랑" && !t.alone?.includes("강아지랑")) return null;
    if (act.time > answers.hours * 60) return null;
    // 시간대 감점
    const currentSlot = getTimeSlot();
    const timeSlotMismatch = act.timeSlots && act.timeSlots.length > 0 && !act.timeSlots.includes(currentSlot);
    if (answers.cost === "무료" && !t.cost?.includes("무료")) return null;
    if (answers.blacklistGenres?.includes(act.genre)) return null;
    // 확장 블랙리스트
    const bl = answers.blacklistGenres || [];
    if (bl.includes("reading") && (act.name?.includes("독서") || act.name?.includes("책 ") || act.genre === "culture" && act.name?.includes("읽"))) return null;
    if (bl.includes("streaming") && (act.name?.includes("넷플릭스") || act.name?.includes("유튜브") || act.name?.includes("영상") || act.name?.includes("영화"))) return null;
    if (bl.includes("meditation") && (act.name?.includes("명상") || act.name?.includes("마음챙김"))) return null;
    if (bl.includes("drinking") && (act.name?.includes("술") || act.name?.includes("와인") || act.name?.includes("맥주") || act.name?.includes("칵테일") || act.name?.includes("바 "))) return null;
    if (bl.includes("shopping") && (act.name?.includes("쇼핑") || act.name?.includes("마트") || act.name?.includes("아울렛"))) return null;
    if (bl.includes("drive") && (act.name?.includes("드라이브") || act.genre === "drive")) return null;
    if (bl.includes("foodtour") && (act.name?.includes("맛집") || act.name?.includes("먹방") || act.name?.includes("투어") && act.genre === "food")) return null;
    // 계절 필터
    const currentMonth = new Date().getMonth() + 1;
    if (SEASONAL_ACTIVITIES[act.id] && !SEASONAL_ACTIVITIES[act.id].includes(currentMonth)) return null;
    const fishingIds = [70,71,72,73];
    const waterSportIds = [74,75,76,77,78,79,80];
    if (bl.includes("fishing") && fishingIds.includes(act.id)) return null;
    if (bl.includes("watersport") && waterSportIds.includes(act.id)) return null;

    // 시간대 불일치 감점
    if (timeSlotMismatch) score -= 10;

    // 기본 스코어
    if (answers.need && t.need?.includes(answers.need)) score += 5;
    if (t.location?.includes(answers.location)) score += 2;
    if (answers.cost && t.cost?.includes(answers.cost)) score += 1;

    // 같이 모드 보너스
    if (answers.alone === "같이" && togetherWith) {
      if (togetherGenreBonus[togetherWith]?.includes(act.genre)) score += 3;
      if (togetherWith === "연인") {
        if (act.withWho?.includes("couple")) score += 6;
        if (act.vibe?.some(v => ["데이트", "로맨틱"].includes(v))) score += 4;
      }
      if (togetherWith === "친구" && act.withWho?.includes("friend")) score += 2;
      if (togetherWith === "가족" && act.withWho?.includes("family")) score += 2;
    }

    // vibe 직접 매칭
    if (allSubs.length && act.vibe?.length) {
      const vibeHits = allSubs.filter(s => act.vibe.includes(s)).length;
      score += vibeHits * 3;
    }

    // 온보딩 선호 vibe 보너스
    if (answers.preferredVibes?.length && act.vibe?.length) {
      const prefHits = answers.preferredVibes.filter(v => act.vibe.includes(v)).length;
      score += prefHits * 4;
    }

    // 추천 이유 생성
    const matchedVibes = [...allSubs, ...(answers.preferredVibes || [])]
      .filter(v => act.vibe?.includes(v));
    const reasonParts = [...new Set(matchedVibes.slice(0,2))].map(v => VIBE_KO[v] || v);
    const reason = reasonParts.length
      ? `네가 ${reasonParts.join(" + ")} 고른 거랑 잘 맞아`
      : answers.need === "멍때리기" ? "뭔가 틀어놓기만 해도 되는 거야"
      : answers.need === "성취감" ? "오늘 뭔가 해낸 느낌 줄 수 있어"
      : "지금 네 상태에 잘 맞는 것 같아";

    return { ...act, score, reason };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}

// ─── localStorage 헬퍼 ────────────────────────────────────────
export function getLearnedVibes() {
  try {
    const prefs = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
    return prefs.learnedVibes || [];
  } catch { return []; }
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem("vibe_history") || "[]"); } catch { return []; }
}

export function addHistory(ids) {
  try {
    const prev = getHistory();
    const next = [...new Set([...ids, ...prev])].slice(0, 30);
    localStorage.setItem("vibe_history", JSON.stringify(next));
  } catch {}
}

export function clearHistory() {
  try { localStorage.removeItem("vibe_history"); } catch {}
}

// 피드백 누적 (vibe 패턴 학습)
export function saveFeedback(chosenActivities) {
  try {
    const prev = JSON.parse(localStorage.getItem("vibe_feedback") || "{}");
    chosenActivities.forEach(act => {
      (act.vibe || []).forEach(v => {
        prev[v] = (prev[v] || 0) + 1;
      });
    });
    localStorage.setItem("vibe_feedback", JSON.stringify(prev));

    const sorted = Object.entries(prev).sort((a,b) => b[1]-a[1]).slice(0,5).map(e=>e[0]);
    const prefs = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
    prefs.learnedVibes = sorted;
    localStorage.setItem("vibe_prefs", JSON.stringify(prefs));
  } catch {}
}
