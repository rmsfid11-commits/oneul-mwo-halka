// 장소 타입 추천 엔진
// prefs: { vibe, withWho, budget, timeSlot, weather }

/**
 * 장소 후보를 필터 + 스코어로 정렬하여 추천
 * @param {Array} places - 장소 데이터 배열
 * @param {Object} prefs - 사용자 선호
 * @returns {{ main: Object, alternatives: Object[] }}
 */
export function recommendPlace(places, prefs) {
  const { vibe, withWho, budget, timeSlot, weather } = prefs;

  // 1단계: 필터 — 하드 조건에 맞지 않으면 제외
  const filtered = places.filter((p) => {
    // withWho 필터
    if (withWho && p.withWho && p.withWho.length > 0) {
      if (!p.withWho.includes(withWho)) return false;
    }
    // budget 필터
    if (budget && p.budget && p.budget.length > 0) {
      if (!p.budget.includes(budget)) return false;
    }
    // weather 필터: 비 오는데 야외만 가능한 곳은 제외
    if (weather === "rain" && p.weatherFit && p.weatherFit.length > 0) {
      if (!p.weatherFit.includes("rain")) return false;
    }
    return true;
  });

  // 필터 결과가 너무 적으면 전체에서 스코어링
  const pool = filtered.length >= 3 ? filtered : places;

  // 2단계: 스코어링
  const scored = pool.map((p) => {
    let score = 0;

    // vibe 일치: 사용자 vibe 배열과 장소 vibe 배열의 교집합 크기
    if (vibe && Array.isArray(vibe) && p.vibe && Array.isArray(p.vibe)) {
      const overlap = vibe.filter((v) => p.vibe.includes(v)).length;
      score += overlap * 2;
    } else if (vibe && typeof vibe === "string" && p.vibe) {
      if (p.vibe.includes(vibe)) score += 3;
    }

    // timeSlot 일치 +2
    if (timeSlot && p.timeSlot && p.timeSlot.includes(timeSlot)) score += 2;

    // budget 일치 +1
    if (budget && p.budget && p.budget.includes(budget)) score += 1;

    // withWho 일치 +1
    if (withWho && p.withWho && p.withWho.includes(withWho)) score += 1;

    // weather 일치 +1
    if (weather && p.weatherFit && p.weatherFit.includes(weather)) score += 1;

    // 약간의 랜덤성 추가 (0~1.5)
    score += Math.random() * 1.5;

    return { place: p, score };
  });

  // 점수순 정렬
  scored.sort((a, b) => b.score - a.score);

  const main = scored[0]?.place || null;
  const alternatives = scored.slice(1, 3).map((s) => s.place);

  return { main, alternatives };
}
