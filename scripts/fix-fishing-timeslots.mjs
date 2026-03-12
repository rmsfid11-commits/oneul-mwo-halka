// 낚시 활동 timeSlots 수정: 낚시는 아침/오후/저녁/밤 다 가능
import { readFileSync, writeFileSync } from "fs";

const FILE = new URL("../src/data/activities.js", import.meta.url).pathname;
let src = readFileSync(FILE, "utf8");

const fishingIds = [1, 71, 72, 73];
let count = 0;

for (const id of fishingIds) {
  // 해당 id 블록에서 timeSlots 찾기
  const idRe = new RegExp(`id:\\s*${id},`);
  const idMatch = idRe.exec(src);
  if (!idMatch) continue;

  // id 위치부터 다음 timeSlots 찾기
  const after = src.slice(idMatch.index);
  const tsMatch = after.match(/timeSlots:\s*\[[^\]]*\]/);
  if (!tsMatch) continue;

  const oldTs = tsMatch[0];
  const newTs = 'timeSlots: ["morning", "afternoon", "evening", "night"]';

  const pos = idMatch.index + tsMatch.index;
  src = src.slice(0, pos) + newTs + src.slice(pos + oldTs.length);
  count++;
}

writeFileSync(FILE, src);
console.log(`${count}개 낚시 활동 timeSlots 업데이트 완료`);
