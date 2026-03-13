// 음식 추천 엔진 v2
// 랜덤 축소, 대안 다양화 (다른 카테고리), reason 추가

/**
 * 음식 후보를 필터 + 스코어로 정렬하여 추천
 * @param {Array} foods - 음식 데이터 배열
 * @param {Object} prefs - 사용자 선호
 * @returns {{ main: Object, alternatives: Object[], reason: string }}
 */
export function recommendFood(foods, prefs) {
  const { mood, withWho, budget, timeSlot, heaviness } = prefs;

  // 1단계: 하드 필터
  const filtered = foods.filter((f) => {
    if (withWho && f.withWho && f.withWho.length > 0) {
      if (!f.withWho.includes(withWho)) return false;
    }
    if (budget && f.budget && f.budget.length > 0) {
      if (!f.budget.includes(budget)) return false;
    }
    return true;
  });

  const pool = filtered.length >= 5 ? filtered : foods;

  // 2단계: 스코어링 (랜덤 축소: 1.5 → 0.3)
  const scored = pool.map((f) => {
    let score = 0;

    // mood 일치 +4 (핵심)
    if (mood && f.mood && f.mood.includes(mood)) score += 4;

    // timeSlot 일치 +3
    if (timeSlot && f.timeSlots && f.timeSlots.includes(timeSlot)) score += 3;

    // budget 일치 +2
    if (budget && f.budget && f.budget.includes(budget)) score += 2;

    // heaviness 일치 +2
    if (heaviness && f.heaviness === heaviness) score += 2;

    // withWho 일치 +1
    if (withWho && f.withWho && f.withWho.includes(withWho)) score += 1;

    // 랜덤 축소
    score += Math.random() * 0.3;

    return { food: f, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const main = scored[0]?.food || null;

  // 대안 다양화: 메인과 다른 카테고리 우선
  const mainCat = main?.category || "";
  const altPool = scored.slice(1);

  // 1순위: 다른 카테고리
  const diffCat = altPool.filter((s) => s.food.category !== mainCat);
  // 2순위: 같은 카테고리 (다른 결 — heaviness 다른 것)
  const sameCatDiffWeight = altPool.filter(
    (s) => s.food.category === mainCat && s.food.heaviness !== main?.heaviness
  );

  const alternatives = [];
  // 첫 대안: 다른 카테고리에서
  if (diffCat.length > 0) alternatives.push(diffCat[0].food);
  // 둘째 대안: 또 다른 카테고리 or 같은 카테고리 다른 결
  if (diffCat.length > 1) {
    // 첫 대안과도 카테고리 다른 걸 찾기
    const firstAltCat = alternatives[0]?.category;
    const thirdOption = diffCat.find(
      (s) => s.food.category !== mainCat && s.food.category !== firstAltCat
    );
    if (thirdOption) {
      alternatives.push(thirdOption.food);
    } else {
      alternatives.push(diffCat[1].food);
    }
  } else if (sameCatDiffWeight.length > 0) {
    alternatives.push(sameCatDiffWeight[0].food);
  } else if (altPool.length > 0) {
    alternatives.push(altPool[0].food);
  }

  // 부족하면 채우기
  while (alternatives.length < 2 && altPool.length > alternatives.length) {
    const next = altPool[alternatives.length];
    if (next && !alternatives.find((a) => a.id === next.food.id)) {
      alternatives.push(next.food);
    } else break;
  }

  // reason 생성
  const reason = generateFoodReason(main, prefs);

  return { main, alternatives, reason };
}

function generateFoodReason(food, prefs) {
  if (!food) return "";
  const parts = [];

  if (prefs.mood) {
    const moodMap = {
      든든한: "든든한 게 당기는 기분이라",
      가벼운: "가볍게 먹고 싶은 기분이라",
      매콤자극: "매콤하게 자극적인 게 당겨서",
      위로: "따끈하게 위로받고 싶은 기분이라",
      특별한: "오늘 좀 특별하게 먹고 싶어서",
    };
    if (moodMap[prefs.mood]) parts.push(moodMap[prefs.mood]);
  }

  if (prefs.timeSlot) {
    const slotMap = {
      breakfast: "아침 시간대에 맞는",
      lunch: "점심으로 딱 좋은",
      afternoon: "오후 간식으로 어울리는",
      dinner: "저녁으로 괜찮은",
      latenight: "야식으로 땡기는",
    };
    if (slotMap[prefs.timeSlot]) parts.push(slotMap[prefs.timeSlot]);
  }

  if (parts.length === 0) return `${food.emoji} ${food.name} 어때?`;
  return `${parts.join(", ")} ${food.emoji} ${food.name} 추천!`;
}
