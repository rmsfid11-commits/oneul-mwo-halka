// 음식 추천 엔진
// prefs: { mood, withWho, budget, timeSlot, heaviness }

/**
 * 음식 후보를 필터 + 스코어로 정렬하여 추천
 * @param {Array} foods - 음식 데이터 배열
 * @param {Object} prefs - 사용자 선호
 * @returns {{ main: Object, alternatives: Object[], afterActivity: Object|null }}
 */
export function recommendFood(foods, prefs) {
  const { mood, withWho, budget, timeSlot, heaviness } = prefs;

  // 1단계: 필터 — 하드 조건에 맞지 않으면 제외
  const filtered = foods.filter((f) => {
    // withWho 필터: 데이터에 withWho 배열이 있으면 매칭 체크
    if (withWho && f.withWho && f.withWho.length > 0) {
      if (!f.withWho.includes(withWho)) return false;
    }
    // budget 필터
    if (budget && f.budget && f.budget.length > 0) {
      if (!f.budget.includes(budget)) return false;
    }
    return true;
  });

  // 필터 결과가 너무 적으면 전체에서 스코어링
  const pool = filtered.length >= 3 ? filtered : foods;

  // 2단계: 스코어링
  const scored = pool.map((f) => {
    let score = 0;

    // mood 일치 +3
    if (mood && f.mood && f.mood.includes(mood)) score += 3;

    // timeSlot 일치 +2
    if (timeSlot && f.timeSlot && f.timeSlot.includes(timeSlot)) score += 2;

    // budget 일치 +1
    if (budget && f.budget && f.budget.includes(budget)) score += 1;

    // heaviness 일치 +1
    if (heaviness && f.heaviness === heaviness) score += 1;

    // withWho 일치 +1
    if (withWho && f.withWho && f.withWho.includes(withWho)) score += 1;

    // 약간의 랜덤성 추가 (0~1.5)
    score += Math.random() * 1.5;

    return { food: f, score };
  });

  // 점수순 정렬
  scored.sort((a, b) => b.score - a.score);

  const main = scored[0]?.food || null;
  const alternatives = scored.slice(1, 3).map((s) => s.food);

  // afterActivity: 식후 활동 추천 (간단한 매칭)
  // 음식 데이터에 afterActivity 필드가 있으면 사용, 없으면 null
  const afterActivity = main?.afterActivity || null;

  return { main, alternatives, afterActivity };
}
