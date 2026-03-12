// localStorage 유틸리티 모듈
// 기존 App.jsx에 흩어져 있던 localStorage 로직을 모아 관리

const KEYS = {
  prefs: "vibe_prefs",
  feedback: "vibe_feedback",
  history: "vibe_history",
  onboarded: "vibe_onboarded",
};

// ── 사용자 선호도 ──

export function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.prefs) || "{}");
  } catch {
    return {};
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEYS.prefs, JSON.stringify(prefs));
  } catch {}
}

// ── 히스토리 (최근 선택한 활동 ID) ──

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.history) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(ids) {
  try {
    const prev = getHistory();
    const next = [...new Set([...ids, ...prev])].slice(0, 30);
    localStorage.setItem(KEYS.history, JSON.stringify(next));
  } catch {}
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEYS.history);
  } catch {}
}

// ── 피드백 (vibe별 누적 카운트) ──

export function getFeedback() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.feedback) || "{}");
  } catch {
    return {};
  }
}

export function saveFeedback(vibeMap) {
  try {
    localStorage.setItem(KEYS.feedback, JSON.stringify(vibeMap));
  } catch {}
}

// ── 학습된 vibe (피드백 기반 상위 5개) ──

export function getLearnedVibes() {
  try {
    const prefs = getPrefs();
    return prefs.learnedVibes || [];
  } catch {
    return [];
  }
}

// ── 온보딩 상태 ──

export function isOnboarded() {
  return !!localStorage.getItem(KEYS.onboarded);
}

export function setOnboarded(value) {
  if (value) {
    localStorage.setItem(KEYS.onboarded, "1");
  } else {
    localStorage.removeItem(KEYS.onboarded);
    localStorage.removeItem(KEYS.prefs);
  }
}
