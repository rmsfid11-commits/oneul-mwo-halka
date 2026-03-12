// rarity 필드 추가 스크립트
// common: 일상적으로 하는 활동
// uncommon: 가끔, 특별한 활동
// weird: 의외성 있는, 잡스러운 활동 (앱의 캐릭터!)

import { readFileSync, writeFileSync } from "fs";

const FILE = new URL("../src/data/activities.js", import.meta.url).pathname;
let src = readFileSync(FILE, "utf8");

// ── 분류 맵 ──
const weird = new Set([
  19,  // 위키피디아 탐험
  25,  // 라면 업그레이드
  28,  // 편의점 야식 투어
  29,  // 방 청소 한 구역만
  30,  // 옷장 정리
  32,  // 핸드폰 사진 정리
  33,  // 구독 / 앱 정리
  104, // 냉장고 파먹기 도전
  105, // 달고나 커피 만들기
  106, // 편의점 디저트 조합
  107, // 좋아하는 노래 가사 외우기
  108, // 유튜브 먹방 대리만족
  109, // 인스타 팔로우 정리
  111, // 안 읽은 카톡 정리
  114, // 이불 세탁 돌리기
  117, // 책상 위 사진 정리
  123, // 가계부 정리
  125, // 오늘 날씨에 맞는 옷 코디
  130, // 냉장고 정리
  131, // 동네 뒷골목 탐험
  133, // 새벽 편의점 산책
  135, // 버스 종점까지 타보기
  143, // 밤에 혼자 라면
]);

const uncommon = new Set([
  5,   // ASMR + 스트레칭
  8,   // 아로마 족욕
  15,  // 단편 / 독립영화
  18,  // TED 강연 보기
  34,  // 새 앱 만들어보기
  36,  // 구글맵 해외여행
  37,  // 영상 편집 도전
  41,  // 뜨개질 / 자수
  43,  // 버킷리스트 작성
  45,  // 글쓰기 / 단편소설
  46,  // 홈 가드닝
  48,  // 도자기 공방
  49,  // 가죽공방
  50,  // 캔들 / 디퓨저 만들기
  51,  // 유리공예
  52,  // 플라워 클래스
  53,  // 향수 만들기
  54,  // 테라리움 만들기
  58,  // 별 보기 / 천문대
  66,  // 일출 / 일몰 보기
  69,  // 패러글라이딩
  74,  // 스노클링
  75,  // 스쿠버다이빙
  76,  // 서핑
  77,  // 카약 / 카누
  78,  // 수상 스키 / 웨이크보드
  79,  // 래프팅
  81,  // 산악자전거
  97,  // 방탈출
  99,  // VR 체험
  100, // 재비 후키랑 놀기
  101, // 재비 후키랑 산책
  102, // 강아지 목욕 / 그루밍
  103, // 강아지 간식 만들기
  115, // 향수 컬렉션 테스트
  120, // 입술 / 손 관리
  124, // 위시리스트 업데이트
  128, // 손 편지 써보기
  129, // 좋아하는 공간 인테리어 탐색
  132, // 공원 벤치에서 멍때리기
  134, // 꽃집 구경
  136, // 마트 구경
  142, // 새벽 드라이브
  150, // 눈 오는 날 산책
  151, // 오토캠핑
  152, // 차박
  153, // 백패킹
  154, // 비박
  155, // 솔로캠핑
  156, // 불멍
  157, // 캠핑 메뉴 계획 짜기
  158, // 캠핑 장비 손질
  159, // 감성캠핑 세팅
  176, // 플로팅 테라피
]);

// 나머지는 전부 common

// ── mainTags 뒤에 rarity 삽입 ──
let count = 0;
const idPattern = /(\n\s*)(id:\s*)(\d+),/g;
let match;

// 모든 id 위치 찾기
const positions = [];
while ((match = idPattern.exec(src)) !== null) {
  positions.push({
    id: Number(match[3]),
    index: match.index,
  });
}

// 뒤에서부터 삽입 (앞에서 하면 인덱스 밀림)
for (let i = positions.length - 1; i >= 0; i--) {
  const { id } = positions[i];
  const rarity = weird.has(id) ? "weird" : uncommon.has(id) ? "uncommon" : "common";

  // 이 활동의 블록에서 mainTags: [...] 찾기
  const blockStart = positions[i].index;
  const blockEnd = i < positions.length - 1 ? positions[i + 1].index : src.length;
  const block = src.slice(blockStart, blockEnd);

  // 이미 rarity가 있으면 스킵
  if (block.includes("rarity:")) continue;

  // mainTags: [...] 뒤에 삽입
  const mainTagsEnd = block.match(/mainTags:\s*\[[\s\S]*?\]/);
  if (mainTagsEnd) {
    const insertPos = blockStart + mainTagsEnd.index + mainTagsEnd[0].length;
    const insertStr = `,\n    rarity: "${rarity}"`;
    src = src.slice(0, insertPos) + insertStr + src.slice(insertPos);
    count++;
  }
}

writeFileSync(FILE, src);

// 통계
let cCount = 0, uCount = 0, wCount = 0;
const rarityMatches = [...src.matchAll(/rarity:\s*"(\w+)"/g)];
for (const m of rarityMatches) {
  if (m[1] === "common") cCount++;
  else if (m[1] === "uncommon") uCount++;
  else if (m[1] === "weird") wCount++;
}

console.log(`✅ ${count}개 활동에 rarity 필드 추가!`);
console.log(`   common: ${cCount}개`);
console.log(`   uncommon: ${uCount}개`);
console.log(`   weird: ${wCount}개`);
