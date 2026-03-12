// 2차 goodAfter/goodBefore 개별화 스크립트
// 중복이 심한 55개 활동을 활동 특성에 맞게 개별화

import { readFileSync, writeFileSync } from "fs";

const FILE = new URL("../src/data/activities.js", import.meta.url).pathname;
let src = readFileSync(FILE, "utf8");

// 개별화 맵: id → { goodAfter, goodBefore }
const overrides = {
  // ── Group 1: Travel (기존 ["cafe_quiet","meal_light","photo"]) ──
  55: { // 드라이브
    goodAfter: ["cafe_view", "meal_light", "walk_night"],
    goodBefore: ["coffee_takeout", "music_listen"],
  },
  56: { // 바다 드라이브
    goodAfter: ["seafood_meal", "cafe_view", "walk_short"],
    goodBefore: ["coffee_takeout", "snack_prepare"],
  },
  57: { // 야경 보러 가기
    goodAfter: ["late_snack", "home_rest", "sleep_ready"],
    goodBefore: ["meal_light", "coffee_takeout", "drive_short"],
  },
  58: { // 별 보기 / 천문대
    goodAfter: ["drive_short", "home_rest", "sleep_ready"],
    goodBefore: ["drive_short", "coffee_takeout", "meal_light"],
  },
  59: { // 플리마켓 구경
    goodAfter: ["cafe_quiet", "walk", "shopping_light"],
    goodBefore: ["walk", "coffee_takeout", "meal_light"],
  },
  60: { // 서점 구경
    goodAfter: ["cafe_quiet", "journal", "walk"],
    goodBefore: ["meal_light", "coffee_takeout", "walk_short"],
  },
  61: { // 동네 카페 탐방
    goodAfter: ["walk", "photo", "journal"],
    goodBefore: ["walk_short", "shopping_light"],
  },
  131: { // 동네 뒷골목 탐험
    goodAfter: ["photo", "meal_light", "cafe_quiet"],
    goodBefore: ["walk", "coffee_takeout"],
  },
  133: { // 새벽 편의점 산책
    goodAfter: ["home_rest", "sleep_ready", "late_snack"],
    goodBefore: ["walk_night", "home_rest"],
  },
  134: { // 꽃집 구경
    goodAfter: ["cafe_quiet", "walk", "photo"],
    goodBefore: ["walk_short", "coffee_takeout", "shopping_light"],
  },
  135: { // 버스 종점까지 타보기
    goodAfter: ["walk", "meal_light", "home_rest"],
    goodBefore: ["coffee_takeout", "music_listen"],
  },
  136: { // 마트 구경
    goodAfter: ["home_rest", "cooking_simple", "walk_short"],
    goodBefore: ["meal_light", "walk", "coffee_takeout"],
  },
  142: { // 새벽 드라이브
    goodAfter: ["home_rest", "sleep_ready", "late_snack"],
    goodBefore: ["music_listen", "home_rest"],
  },

  // ── Group 2: Indoor/Culture (기존 ["cafe_quiet","walk","meal_light"]) ──
  107: { // 좋아하는 노래 가사 외우기
    goodAfter: ["music_listen", "walk_short", "home_rest"],
    goodBefore: ["home_rest", "tea_time"],
  },
  108: { // 유튜브 먹방 대리만족
    goodAfter: ["meal_light", "cooking_simple", "late_snack"],
    goodBefore: ["home_rest", "walk_short"],
  },
  110: { // 좋아하는 영화 다시 보기
    goodAfter: ["sleep_ready", "tea_time", "walk_short"],
    goodBefore: ["snack_prepare", "home_rest", "shower"],
  },
  112: { // 좋아하는 유튜버 정주행
    goodAfter: ["walk_short", "meal_light", "sleep_ready"],
    goodBefore: ["home_rest", "snack_prepare"],
  },
  113: { // 넷플릭스 뭐볼까 탐색
    goodAfter: ["home_movie", "snack_prepare", "walk_short"],
    goodBefore: ["home_rest", "tea_time"],
  },
  118: { // 좋아하는 작가 신작 탐색
    goodAfter: ["cafe_quiet", "journal", "walk"],
    goodBefore: ["coffee_takeout", "home_rest"],
  },
  122: { // 좋아하는 연예인 영상 탐방
    goodAfter: ["walk_short", "late_snack", "sleep_ready"],
    goodBefore: ["home_rest", "tea_time"],
  },
  125: { // 오늘 날씨에 맞는 옷 코디
    goodAfter: ["photo", "walk", "cafe_quiet"],
    goodBefore: ["shower", "home_rest"],
  },
  126: { // 좋아하는 팟캐스트 새 에피소드
    goodAfter: ["walk", "journal", "tea_time"],
    goodBefore: ["coffee_takeout", "walk_short"],
  },
  127: { // 구독 유튜브 몰아보기
    goodAfter: ["walk_short", "meal_light", "sleep_ready"],
    goodBefore: ["home_rest", "snack_prepare"],
  },
  128: { // 손 편지 써보기
    goodAfter: ["tea_time", "walk_short", "cafe_quiet"],
    goodBefore: ["cafe_quiet", "music_listen", "home_rest"],
  },
  145: { // 밤에 일기 쓰기
    goodAfter: ["sleep_ready", "tea_time", "music_home"],
    goodBefore: ["shower", "home_rest"],
  },

  // ── Group 3: Water (기존 ["meal_hearty","cafe_quiet","drive_short"]) ──
  70: { // 찌낚시
    goodAfter: ["meal_hearty", "cafe_quiet", "home_rest"],
    goodBefore: ["drive_short", "coffee_takeout", "meal_light"],
  },
  71: { // 루어낚시
    goodAfter: ["meal_hearty", "drive_short", "cafe_view"],
    goodBefore: ["drive_short", "coffee_takeout"],
  },
  72: { // 바다낚시 (선상)
    goodAfter: ["seafood_meal", "shower", "home_rest"],
    goodBefore: ["drive_short", "meal_light"],
  },
  73: { // 민물낚시 (저수지)
    goodAfter: ["meal_hearty", "drive_short", "home_rest"],
    goodBefore: ["drive_short", "coffee_takeout", "meal_light"],
  },
  74: { // 스노클링
    goodAfter: ["shower", "cafe_view", "meal_light"],
    goodBefore: ["drive_short", "meal_light"],
  },
  75: { // 스쿠버다이빙
    goodAfter: ["shower", "meal_hearty", "home_rest"],
    goodBefore: ["drive_short", "meal_light"],
  },
  76: { // 서핑
    goodAfter: ["shower", "meal_hearty", "cafe_view"],
    goodBefore: ["drive_short", "coffee_takeout"],
  },
  77: { // 카약 / 카누
    goodAfter: ["cafe_quiet", "meal_light", "walk_short"],
    goodBefore: ["drive_short", "coffee_takeout"],
  },
  78: { // 수상 스키 / 웨이크보드
    goodAfter: ["shower", "meal_hearty", "home_rest"],
    goodBefore: ["drive_short", "meal_light"],
  },
  79: { // 래프팅
    goodAfter: ["meal_hearty", "shower", "cafe_view"],
    goodBefore: ["drive_short", "meal_light"],
  },
  80: { // 수영
    goodAfter: ["shower", "meal_light", "home_rest"],
    goodBefore: ["walk_short", "coffee_takeout"],
  },

  // ── Group 4: Cooking (기존 ["walk_short","home_rest","home_movie"]) ──
  22: { // 홈카페 차려먹기
    goodAfter: ["home_rest", "journal", "walk_short"],
    goodBefore: ["shopping_light", "home_rest"],
  },
  104: { // 냉장고 파먹기 도전
    goodAfter: ["home_movie", "walk_short", "sleep_ready"],
    goodBefore: ["home_rest", "walk_short"],
  },
  105: { // 달고나 커피 만들기
    goodAfter: ["home_rest", "photo", "home_movie"],
    goodBefore: ["home_rest", "music_listen"],
  },
  106: { // 편의점 디저트 조합
    goodAfter: ["walk", "home_movie", "home_rest"],
    goodBefore: ["walk_short", "walk"],
  },
  137: { // 동네 떡볶이 먹기
    goodAfter: ["walk", "cafe_quiet", "home_rest"],
    goodBefore: ["walk_short", "walk"],
  },
  141: { // 야식 시켜먹기
    goodAfter: ["home_movie", "sleep_ready", "home_rest"],
    goodBefore: ["home_rest", "home_movie"],
  },
  143: { // 밤에 혼자 라면
    goodAfter: ["sleep_ready", "home_movie", "walk_night"],
    goodBefore: ["home_rest", "walk_night"],
  },
  146: { // 모닝 커피 루틴
    goodAfter: ["walk", "journal", "shower"],
    goodBefore: ["shower", "home_rest"],
  },
  148: { // 브런치 카페 가기
    goodAfter: ["walk", "shopping_light", "cafe_quiet"],
    goodBefore: ["shower", "drive_short"],
  },
  149: { // 따뜻한 음료 만들어 마시기
    goodAfter: ["home_rest", "journal", "music_home"],
    goodBefore: ["shower", "home_rest"],
  },

  // ── Group 5: Relax + Game (기존 ["meal_light","walk_short","home_rest"]) ──
  173: { // 찜질방
    goodAfter: ["meal_light", "sleep_ready", "home_rest"],
    goodBefore: ["shower", "walk_short"],
  },
  174: { // 마사지샵
    goodAfter: ["cafe_quiet", "home_rest", "sleep_ready"],
    goodBefore: ["shower", "walk_short"],
  },
  175: { // 수면 카페
    goodAfter: ["home_rest", "tea_time", "sleep_ready"],
    goodBefore: ["meal_light", "walk_short"],
  },
  176: { // 플로팅 테라피
    goodAfter: ["tea_time", "home_rest", "cafe_quiet"],
    goodBefore: ["drive_short", "walk_short"],
  },
  177: { // 닌텐도 스위치
    goodAfter: ["walk_short", "late_snack", "home_rest"],
    goodBefore: ["home_rest", "meal_light"],
  },
  178: { // PC방
    goodAfter: ["meal_hearty", "walk", "home_rest"],
    goodBefore: ["meal_light", "coffee_takeout"],
  },
  179: { // 아케이드 게임센터
    goodAfter: ["meal_light", "walk", "cafe_quiet"],
    goodBefore: ["walk_short", "coffee_takeout"],
  },
  180: { // 퍼즐 맞추기
    goodAfter: ["tea_time", "walk_short", "home_rest"],
    goodBefore: ["home_rest", "coffee_takeout"],
  },
  181: { // 보드게임 혼자 하기
    goodAfter: ["walk_short", "meal_light", "sleep_ready"],
    goodBefore: ["home_rest", "snack_prepare"],
  },
};

// ── 치환 로직 ──
// 각 활동의 goodAfter/goodBefore 블록을 찾아서 교체
let changed = 0;

for (const [idStr, override] of Object.entries(overrides)) {
  const id = Number(idStr);

  // id: <num> 패턴으로 해당 활동 블록 시작점 찾기
  const idPattern = new RegExp(`(\\n\\s*id:\\s*${id},)`);
  const idMatch = src.match(idPattern);
  if (!idMatch) {
    console.warn(`⚠️  id ${id} not found`);
    continue;
  }
  const blockStart = idMatch.index;

  // 다음 활동 블록 시작 or 파일 끝까지의 범위
  const nextIdPattern = new RegExp(`\\n\\s*id:\\s*(?!${id}\\b)\\d+,`);
  const nextMatch = src.slice(blockStart + 10).match(nextIdPattern);
  const blockEnd = nextMatch
    ? blockStart + 10 + nextMatch.index
    : src.length;

  let block = src.slice(blockStart, blockEnd);

  // goodAfter 교체
  if (override.goodAfter) {
    const gaStr = JSON.stringify(override.goodAfter)
      .replace("[", "[\n      ")
      .replace(/,/g, ",\n      ")
      .replace("]", "\n    ]");
    block = block.replace(
      /goodAfter:\s*\[[\s\S]*?\]/,
      `goodAfter: ${gaStr}`
    );
  }

  // goodBefore 교체
  if (override.goodBefore) {
    const gbStr = JSON.stringify(override.goodBefore)
      .replace("[", "[\n      ")
      .replace(/,/g, ",\n      ")
      .replace("]", "\n    ]");
    block = block.replace(
      /goodBefore:\s*\[[\s\S]*?\]/,
      `goodBefore: ${gbStr}`
    );
  }

  src = src.slice(0, blockStart) + block + src.slice(blockEnd);
  changed++;
}

writeFileSync(FILE, src);
console.log(`✅ ${changed}개 활동 goodAfter/goodBefore 개별화 완료!`);

// 검증: 상위 중복 패턴 재확인
const afterPattern = /goodAfter:\s*\[([\s\S]*?)\]/g;
const counts = {};
let m;
while ((m = afterPattern.exec(src)) !== null) {
  const key = m[1].replace(/\s+/g, " ").trim();
  counts[key] = (counts[key] || 0) + 1;
}

const sorted = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
console.log("\n── 교체 후 상위 5 중복 패턴 ──");
for (const [pattern, count] of sorted) {
  console.log(`  ${count}개: [${pattern.slice(0, 60)}...]`);
}
