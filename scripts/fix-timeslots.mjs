// timeSlots 전면 보정 스크립트
// "afternoon"만 있던 활동들을 실제 가능한 시간대로 수정
import { readFileSync, writeFileSync } from "fs";

const FILE = new URL("../src/data/activities.js", import.meta.url).pathname;
let src = readFileSync(FILE, "utf8");

// id → 올바른 timeSlots 매핑
const fixes = {
  // 실내 힐링 — 거의 언제든 가능
  10:  ["morning", "afternoon", "evening"],       // 사우나/온천 (영업시간)
  14:  ["morning", "afternoon", "evening", "night"], // 넷플릭스 영화
  110: ["morning", "afternoon", "evening", "night"], // 좋아하는 영화 다시 보기
  34:  ["morning", "afternoon", "evening", "night"], // 새 앱 만들어보기
  173: ["morning", "afternoon", "evening", "night"], // 찜질방 (24시간)
  178: ["morning", "afternoon", "evening", "night"], // PC방 (24시간)

  // 공연/문화 — 낮/저녁 공연
  21:  ["afternoon", "evening"],                   // 공연/뮤지컬

  // 공방 — 영업시간 기준
  48:  ["morning", "afternoon"],                   // 도자기 공방
  49:  ["morning", "afternoon"],                   // 가죽공방
  51:  ["morning", "afternoon"],                   // 유리공예

  // 드라이브/자연 — 밤 드라이브도 좋음
  56:  ["morning", "afternoon", "evening", "night"], // 바다 드라이브

  // 별 보기 — 밤에만!
  58:  ["evening", "night"],                       // 별 보기 / 천문대

  // 캠핑류 — 하루종일 가능
  63:  ["morning", "afternoon", "evening", "night"], // 캠핑
  64:  ["morning", "afternoon", "evening", "night"], // 글램핑
  151: ["morning", "afternoon", "evening", "night"], // 오토캠핑
  152: ["afternoon", "evening", "night"],            // 차박 (오후~밤)
  153: ["morning", "afternoon", "evening", "night"], // 백패킹
  154: ["afternoon", "evening", "night"],            // 비박 (오후~밤)
  155: ["morning", "afternoon", "evening", "night"], // 솔로캠핑
  156: ["evening", "night"],                         // 불멍 (어두울 때)
  159: ["morning", "afternoon", "evening"],          // 감성캠핑 세팅

  // 등산/트레킹 — 아침이 제일 좋고 낮도 가능
  65:  ["morning", "afternoon"],                   // 트레킹/둘레길
  67:  ["morning", "afternoon"],                   // 등산

  // 액티비티 — 낮에만 안전
  69:  ["morning", "afternoon"],                   // 패러글라이딩
  74:  ["morning", "afternoon"],                   // 스노클링
  75:  ["morning", "afternoon"],                   // 스쿠버다이빙
  76:  ["morning", "afternoon", "evening"],        // 서핑 (새벽서핑도 있지만 morning으로)
  77:  ["morning", "afternoon"],                   // 카약/카누
  79:  ["morning", "afternoon"],                   // 래프팅
  81:  ["morning", "afternoon"],                   // 산악자전거

  // 술/사교 — 저녁/밤이 메인
  94:  ["evening", "night"],                       // 술 한 잔
  95:  ["afternoon", "evening", "night"],          // 노래방
  96:  ["afternoon", "evening", "night"],          // 보드게임 카페
  190: ["evening", "night"],                       // 칵테일바/와인바

  // 음식
  191: ["morning", "afternoon"],                   // 맛집 오픈런 (점심/브런치)
};

let count = 0;
for (const [id, slots] of Object.entries(fixes)) {
  const idRe = new RegExp(`id:\\s*${id},`);
  const idMatch = idRe.exec(src);
  if (!idMatch) {
    console.log(`⚠️ id:${id} 못 찾음`);
    continue;
  }

  const after = src.slice(idMatch.index);
  const tsMatch = after.match(/timeSlots:\s*\[[^\]]*\]/);
  if (!tsMatch) {
    console.log(`⚠️ id:${id} timeSlots 없음`);
    continue;
  }

  const oldTs = tsMatch[0];
  const newTs = `timeSlots: [${slots.map(s => `"${s}"`).join(", ")}]`;

  if (oldTs === newTs) continue; // 이미 동일

  const pos = idMatch.index + tsMatch.index;
  src = src.slice(0, pos) + newTs + src.slice(pos + oldTs.length);
  count++;
}

writeFileSync(FILE, src);

// 통계
console.log(`✅ ${count}개 활동 timeSlots 수정 완료`);
console.log("\n변경 내용:");
for (const [id, slots] of Object.entries(fixes)) {
  console.log(`  id:${id} → [${slots.join(", ")}]`);
}
