import { places } from '../../data/places.js';

// 기분 → vibe 매핑
const PLACE_MOOD_VIBES = {
  chill: ["고요함","힐링","평화로움","느긋함","편안한"],
  active: ["활동적","신나는","재미","해방감","성취감"],
  romantic: ["감성","로맨틱","특별함","영감","지적"],
  random: [],
};

// 활동 장르 → 어울리는 장소 이름/태그/타입 매핑
// ⚠️ 이름은 반드시 places.js의 실제 name 값 기준 (부분 매칭 = includes)
const GENRE_PLACE_MAP = {
  // 기존 10개 (깨진 참조 수정)
  cooking:  { names:["대형마트","전통시장","푸드코트","맛집 탐방","쿠킹클래스","식재료"], tags:["장보기","먹거리","시식","요리"], types:["market","restaurant","craft"] },
  cafe:     { names:["카페","브런치"], tags:["카페","브런치","디저트","커피"], types:["cafe"] },
  art:      { names:["전시회/갤러리","박물관/과학관","복합문화공간"], tags:["전시","문화생활"], types:["culture","craft"] },
  reading:  { names:["독립서점","도서관","서점/독서카페","대형서점","스터디카페"], tags:["서점","독서"], types:["culture"] },
  exercise: { names:["공원/하천","한강공원","둘레길/산책로","호수공원"], tags:["운동","산책","활동적"], types:["nature","walk","outdoor"] },
  music:    { names:["레코드샵/음반가게","공연/뮤지컬","복합문화공간"], tags:["음악","라이브","공연"], types:["culture"] },
  game:     { names:["만화카페/멀티방","복합문화공간"], tags:["게임"], types:["indoor"] },
  photo:    { names:["사진관/셀프스튜디오","전시회/갤러리","감성 벽화마을","핫플"], tags:["사진","인스타","포토"], types:["culture"] },
  walk:     { names:["공원/하천","둘레길/산책로","한강공원","해변/강변","짧게 걷기 좋은 동네"], tags:["산책","자연","바다"], types:["nature","walk","outdoor"] },
  shopping: { names:["쇼핑몰/아울렛","백화점","올리브영","편집샵/셀렉트샵"], tags:["쇼핑","쇼핑몰"], types:["shopping"] },

  // 추가 15개 장르
  tidy:     { names:["다이소/문구점","대형마트","올리브영"], tags:["정리","수납","인테리어"], types:["shopping","indoor"] },
  culture:  { names:["전시회/갤러리","박물관/과학관","공연/뮤지컬","복합문화공간","영화관"], tags:["문화생활","전시","공연"], types:["culture"] },
  healing:  { names:["온천/스파","찜질방/사우나","명상센터","사찰/절","수목원/식물원"], tags:["힐링","마음챙김","이완"], types:["relax","nature"] },
  travel:   { names:["드라이브 코스","해안도로","터미널","제주 올레길","한옥마을","게스트하우스"], tags:["드라이브","여행","당일치기"], types:["drive","outdoor","view"] },
  sport:    { names:["한강공원","공원/하천","둘레길/산책로","해변/강변"], tags:["운동","자전거","활동적"], types:["nature","walk","outdoor"] },
  nature:   { names:["수목원/식물원","공원/하천","해변/강변","호수공원","둘레길/산책로","실내 식물원"], tags:["자연","힐링","산책"], types:["nature","outdoor"] },
  water:    { names:["해변/강변","한강공원","해운대/광안리","해안도로","새벽 한강","아쿠아리움"], tags:["바다","물","해변"], types:["outdoor","nature","view"] },
  food:     { names:["맛집 탐방","포장마차/야시장","한강 치맥","푸드코트","고깃집","분식집","찜닭골목"], tags:["맛집","먹방","맛있는","먹거리"], types:["restaurant","market"] },
  camp:     { names:["글램핑장","펜션","게스트하우스","농장체험"], tags:["캠핑","야외숙박","글램핑"], types:["outdoor"] },
  craft:    { names:["쿠킹클래스/원데이클래스","빈티지/플리마켓","농장체험","복합문화공간"], tags:["만들기","DIY","체험"], types:["craft"] },
  digital:  { names:["스터디카페","도서관","작업하기 좋은 카페","24시 카페"], tags:["작업","온라인"], types:["cafe","culture"] },
  social:   { names:["바/펍","고깃집","한강 치맥","포장마차/야시장","번화가"], tags:["친구","술","모임"], types:["bar","restaurant"] },
  learn:    { names:["도서관","박물관/과학관","대형서점","복합문화공간","대학교 캠퍼스"], tags:["공부","학습","문화생활"], types:["culture"] },
  beauty:   { names:["올리브영/드럭스토어","백화점","편집샵/셀렉트샵","온천/스파"], tags:["뷰티","쇼핑","셀프케어"], types:["shopping"] },
  move:     { names:["드라이브 코스","번화가","핫플","짧게 걷기 좋은 동네"], tags:["드라이브","산책"], types:["drive","walk"] },
  relax:    { names:["온천/스파","찜질방/사우나","24시 찜질방","호캉스","조용한 카페"], tags:["힐링","이완","편안함"], types:["relax","cafe"] },
  pet:      { names:["반려동물 카페","애견동반 카페","공원/하천","한강공원"], tags:["반려동물","애견"], types:["cafe","nature"] },
  mountain: { names:["둘레길/산책로","수목원/식물원","제주 올레길","사찰/절"], tags:["등산","산책","자연"], types:["nature","outdoor","walk"] },
  fitness:  { names:["한강공원","공원/하천","해변/강변","둘레길/산책로"], tags:["운동","자전거","조깅"], types:["nature","outdoor"] },
  cycling:  { names:["한강공원","해안도로","드라이브 코스","공원/하천"], tags:["자전거","라이딩"], types:["nature","outdoor","drive"] },
};

// 집에서 하는 활동인지 판별
function isHomeActivity(activity) {
  if (!activity) return false;
  // tags.location에 "home"만 있으면 집 활동
  const loc = activity.tags?.location;
  if (loc && loc.length === 1 && loc[0] === "home") return true;
  // 이름 기반 판별
  const homeKeywords = ["넷플릭스","유튜브","게임","정리","청소","독서","일기","스트레칭","명상","요가","홈트"];
  if (homeKeywords.some(k => activity.name?.includes(k))) return true;
  return false;
}

// 집 활동용 장소 매핑 — 활동 성격별로 세분화
const HOME_ACTIVITY_PLACES_BY_TYPE = {
  // 릴랙스 계열 (드라마, 유튜브, 향초 등) → 카페, 산책, 편의점
  relax: {
    names: ["조용한 카페","동네 카페","편의점 앞 벤치","짧게 걷기 좋은 동네","찜질방/사우나","24시 카페","테이크아웃 커피","카페거리","분위기 카페","공원/하천","베이커리"],
    tags: ["편안함","조용함","산책","카페","일상","동네"],
  },
  // 운동 계열 (홈트, 요가, 스트레칭) → 편의점, 공원, 주스
  exercise: {
    names: ["편의점 앞 벤치","공원/하천","동네 카페","짧게 걷기 좋은 동네","무인매장/편의점","테이크아웃 커피","한강공원","호수공원","둘레길/산책로"],
    tags: ["산책","활동적","자연","동네"],
  },
  // 정리 계열 (청소, 옷장정리) → 다이소, 마트 (보충/보상)
  tidy: {
    names: ["다이소/문구점","대형마트","동네 카페","올리브영","편의점 앞 벤치","무인매장/편의점","중고샵","꽃집","테이크아웃 커피"],
    tags: ["쇼핑","정리","편안함","일상"],
  },
  // 몰입 계열 (게임, 코딩, 독서) → 만화카페, 카페
  focus: {
    names: ["만화카페/멀티방","스터디카페","24시 카페","동네 카페","편의점 앞 벤치","작업하기 좋은 카페","서점/독서카페","도서관","대형 프랜차이즈 카페"],
    tags: ["오래머물기","실내","조용함","작업"],
  },
  // 기본 (분류 안 될 때)
  default: {
    names: ["동네 카페","편의점 앞 벤치","짧게 걷기 좋은 동네","24시 카페","무인매장/편의점","테이크아웃 커피","공원/하천","카페거리","베이커리","분위기 카페"],
    tags: ["편안함","오래머물기","실내","조용함","동네","일상"],
  },
};

// 집 활동의 세부 타입 판별
function getHomeActivityType(activity) {
  if (!activity) return "default";
  const name = activity.name || "";
  const genre = activity.genre || "";
  const vibe = activity.vibe || [];
  const need = activity.tags?.need || [];
  // 반려동물 계열
  if (["pet"].includes(genre) || ["강아지","고양이","반려","목욕","그루밍","산책"].some(k => name.includes(k))) return "relax";
  // 운동 계열
  if (["fitness","exercise","sport"].includes(genre) || ["홈트","요가","스트레칭","운동","플랭크"].some(k => name.includes(k))) return "exercise";
  // 정리 계열
  if (genre === "tidy" || ["정리","청소"].some(k => name.includes(k)) || need.includes("정리정돈")) return "tidy";
  // 몰입 계열
  if (["game","digital","reading"].includes(genre) || ["게임","코딩","독서","공부"].some(k => name.includes(k))) return "focus";
  // 릴랙스 계열
  if (["넷플릭스","유튜브","드라마","향초","음악","일기","명상"].some(k => name.includes(k)) || vibe.some(v => ["고요함","따뜻함","혼자만의시간"].includes(v))) return "relax";
  return "default";
}

// 현재 시간대 구하기
function getCurrentSlot() {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 14) return "afternoon";
  if (hour < 18) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

// 하드 필터: 시간대 + 실내/야외 + 누구랑
function filterPlaces(pa, curSlot, strict = true) {
  const filtered = places.filter(p => {
    if (strict && p.timeSlots && !p.timeSlots.includes(curSlot)) return false;
    if (pa?.inOut === "indoor" && p.type.includes("outdoor") && !p.type.includes("indoor")) return false;
    if (pa?.inOut === "outdoor" && p.type.includes("indoor") && !p.type.includes("outdoor")) return false;
    if (pa?.who === "alone" && p.withWho && !p.withWho.includes("alone")) return false;
    return true;
  });
  return filtered;
}

// 스코어링 (추천용 — 높은 가중치)
function scorePlaces(pool, pa, ctx, curSlot) {
  const moodVibes = PLACE_MOOD_VIBES[pa?.mood] || [];

  return pool.map(p => {
    let score = 0;

    // 분위기 매칭 +4
    if (moodVibes.length > 0) {
      score += p.vibe.filter(v => moodVibes.includes(v)).length * 4;
    }

    // 시간대 매칭 +3
    if (p.timeSlots?.includes(curSlot)) score += 3;

    // 누구랑 매칭 +3
    if (pa?.who && p.withWho?.includes(pa.who)) score += 3;

    // 예산 매칭 +2
    if (pa?.budget && p.budget?.includes(pa.budget)) score += 2;

    // 밤에 야외 페널티
    if (curSlot === "night" && p.type.includes("outdoor") && !p.name?.includes("야경")) score -= 2;

    // 혼자인데 데이트 태그 페널티
    if (pa?.who === "alone" && p.tags?.some(t => t.includes("데이트"))) score -= 2;

    // 연인 로맨틱 보너스
    if (pa?.who === "partner" && p.vibe?.includes("로맨틱")) score += 3;

    // 가족 보너스
    if (pa?.who === "family" && p.vibe?.some(v => ["활동적","자유로운","평화로움"].includes(v))) score += 2;

    // 다른 탭에서 넘어온 경우 context 보너스
    if (ctx?.from === "whatToDo" && ctx.activity) {
      const homeAct = isHomeActivity(ctx.activity);

      if (homeAct) {
        const actName = ctx.activity.name || "";
        const pName2 = p.name || "";

        // ── 활동-장소 충돌 페널티 (이미 한 걸 또 하라고 하면 안 됨) ──
        // 씻기/목욕 계열 → 찜질방/사우나/온천/스파 제외
        const isBathAct = ["반신욕","목욕","샤워","입욕","족욕","그루밍","때밀기"].some(k => actName.includes(k));
        const isBathPlace = ["찜질방","사우나","온천","스파","24시 찜질방"].some(k => pName2.includes(k));
        if (isBathAct && isBathPlace) { score -= 30; }

        // 운동/땀 계열 → 찜질방/사우나 페널티 (씻고 싶지 또 땀나게 하면 안 됨)
        const isSweatAct = ["홈트","운동","스트레칭","요가","플랭크","줄넘기","댄스"].some(k => actName.includes(k));
        if (isSweatAct && isBathPlace) { score -= 20; }

        // 청소/정리 → 또 정리 관련 장소 약간 페널티
        const isTidyAct = ["청소","정리","빨래"].some(k => actName.includes(k));
        const isTidyPlace = ["다이소","마트"].some(k => pName2.includes(k));
        // 정리 후 보충 목적이면 오히려 OK → 페널티 안 줌

        // 게임/코딩 → 만화카페/멀티방은 OK지만 스터디카페는 분위기 다름 → 그대로 둠

        // ── 활동 성격에 맞는 장소 추천 ──
        const homeType = getHomeActivityType(ctx.activity);
        const homePlaces = HOME_ACTIVITY_PLACES_BY_TYPE[homeType] || HOME_ACTIVITY_PLACES_BY_TYPE.default;
        const nameMatch = homePlaces.names.some(n => p.name?.includes(n));
        const tagMatch = homePlaces.tags.some(t => p.tags?.includes(t));
        if (nameMatch) score += 15;
        else if (tagMatch) score += 8;
        else score -= 10; // 관련 없는 곳 강력 배제
      } else {
        if (ctx.activity.vibe && p.vibe?.some(v => ctx.activity.vibe.includes(v))) score += 3;
        // 활동 장르 → 어울리는 장소 강력 보너스/페널티
        const genreMap = GENRE_PLACE_MAP[ctx.activity.genre];
        if (genreMap) {
          const nameMatch = genreMap.names?.some(n => p.name?.includes(n));
          const tagMatch = genreMap.tags?.some(t => p.tags?.includes(t));
          const typeMatch = genreMap.types?.some(t => p.type?.includes(t));
          if (nameMatch) score += 12;
          else if (tagMatch || typeMatch) score += 7;
          else score -= 8;
        }
      }
    }
    if (ctx?.from === "whatToEat") {
      // 음식 관련 장소 강력 보너스
      const foodPlaceNames = ["맛집 탐방","고깃집","분식집","회전초밥","찜닭골목","포장마차/야시장",
        "푸드코트","한강 치맥","오션뷰 맛집","전통시장","브런치 카페","편의점 앞 벤치"];
      const foodTags = ["맛집","먹방","먹거리","카페","브런치","디저트","길거리음식","먹자골목"];
      const foodTypes = ["cafe","restaurant","market","bar"];
      const isFoodPlace = foodPlaceNames.some(n => p.name?.includes(n))
        || foodTypes.some(t => p.type?.includes(t))
        || p.tags?.some(t => foodTags.includes(t));
      if (isFoodPlace) score += 12;
      // 음식과 완전 무관한 장소 강력 페널티
      if (!isFoodPlace) score -= 6;
    }

    // 집 활동이면 랜덤 가중치 높여서 다양하게
    const isHomeCtx = ctx?.from === "whatToDo" && ctx.activity && isHomeActivity(ctx.activity);
    score += Math.random() * (isHomeCtx ? 6 : 1.5);
    return { place: p, score };
  }).sort((a, b) => b.score - a.score);
}

// 장소-활동 연결 이유 생성 (왜 이 장소를 추천하는지)
function buildConnectionReason(place, ctx) {
  if (!ctx) return null;

  if (ctx.from === "whatToDo" && ctx.activity) {
    const act = ctx.activity;
    const pName = place.name || "";
    const isHome = isHomeActivity(act);

    if (isHome) {
      // 집 활동 → 활동 타입별 장소 연결 이유
      const homeType = getHomeActivityType(act);
      if (homeType === "relax") {
        // 씻기 활동이면 찜질방 메시지 다르게
        const isBath = ["반신욕","목욕","샤워","입욕","족욕","그루밍"].some(k => act.name?.includes(k));
        if ((pName.includes("찜질방") || pName.includes("사우나")) && !isBath)
          return `${act.name} 끝나고 찜질방 가면 완벽한 힐링 코스야.`;
        if (pName.includes("카페"))
          return `${act.name} 하기 전에 카페에서 음료 하나 테이크아웃 해오면 꿀조합이야.`;
        if (pName.includes("편의점"))
          return `간식이랑 음료 사 가지고 들어가면 ${act.name}이 더 완벽해져.`;
        if (pName.includes("걷기") || pName.includes("산책"))
          return `${act.name} 하고 나서 가볍게 동네 한 바퀴 돌면 기분 전환 돼.`;
        return `${act.name} 하다가 잠깐 나가면 기분 전환 돼.`;
      }
      if (homeType === "exercise") {
        if (pName.includes("편의점") || pName.includes("무인"))
          return `운동 끝나고 단백질 음료 하나 사먹으면 보상 느낌이야.`;
        if (pName.includes("공원") || pName.includes("걷기"))
          return `실내 운동 하기 전에 가볍게 걸어서 몸 풀면 좋아.`;
        if (pName.includes("카페"))
          return `운동 끝나고 커피 한 잔이면 완벽한 루틴이야.`;
        return `${act.name} 하고 나서 잠깐 나가서 바람 쐬고 와.`;
      }
      if (homeType === "tidy") {
        if (pName.includes("다이소") || pName.includes("문구"))
          return `정리하다 보면 필요한 게 생기지? 수납용품 사러 가기 딱이야.`;
        if (pName.includes("마트"))
          return `정리 끝나면 냉장고도 채워야지. 장 보러 가기 좋은 타이밍이야.`;
        if (pName.includes("카페"))
          return `${act.name} 열심히 한 나에게 보상! 카페에서 쉬어가.`;
        if (pName.includes("올리브영"))
          return `정리하다 떨어진 생필품 사러 가기 딱이야.`;
        return `${act.name} 끝나고 보상으로 잠깐 나갔다 와.`;
      }
      if (homeType === "focus") {
        if (pName.includes("만화카페") || pName.includes("멀티방"))
          return `집에서 하기 지겨우면 여기서 해봐. 분위기 바뀌면 새로운 느낌이야.`;
        if (pName.includes("스터디") || pName.includes("24시"))
          return `집중이 안 되면 장소를 바꿔보는 것도 방법이야.`;
        if (pName.includes("편의점"))
          return `간식 사서 돌아오면 ${act.name}에 더 집중돼.`;
        if (pName.includes("카페"))
          return `카페 분위기에서 하면 집중력이 달라져.`;
        return `${act.name} 하다 지치면 잠깐 나가서 환기하고 와.`;
      }
      // default
      if (pName.includes("카페")) return `${act.name} 하다가 카페 한 잔이면 하루가 완성이야.`;
      if (pName.includes("편의점")) return `잠깐 바람 쐬면서 간식 사오면 더 좋아.`;
      return `${act.name} 하다가 잠깐 나갔다 오면 기분 전환돼.`;
    }

    // 일반 활동 → 장소
    const genre = act.genre;
    if (genre === "cooking" && (pName.includes("마트") || pName.includes("시장") || pName.includes("식재료")))
      return `요리에 필요한 재료 여기서 사면 돼. 신선한 걸로 골라봐.`;
    if (genre === "cooking" && pName.includes("쿠킹클래스"))
      return `혼자 하기 막막하면 여기서 배우면서 해봐. 레시피도 얻어가고.`;
    if (genre === "art" && (pName.includes("전시") || pName.includes("갤러리")))
      return `직접 만드는 것도 좋지만, 다른 작품 보면 영감이 와.`;
    if (genre === "reading" && (pName.includes("서점") || pName.includes("도서관")))
      return `새로운 책 발견하거나 조용히 읽기 좋은 곳이야.`;
    if (genre === "exercise" || genre === "sport" || genre === "fitness")
      return `운동하기 딱 좋은 환경이야. 끝나고 근처에서 쉬어가도 좋고.`;
    if (genre === "walk" || genre === "nature")
      return `걷기 좋은 길이 잘 되어 있어. 천천히 둘러봐.`;
    if (genre === "craft" && pName.includes("원데이클래스"))
      return `전문가한테 배우면서 만들면 완성도가 다르지.`;
    if (genre === "photo")
      return `여기 사진 찍기 좋아. 감성 제대로 나와.`;
    if (genre === "social")
      return `사람들이랑 어울리기 좋은 분위기야.`;
    if (genre === "healing" || genre === "relax")
      return `제대로 쉬려면 이런 데 와야지. 일상에서 벗어나봐.`;
    if (genre === "travel")
      return `여행 기분 내기 딱 좋아. 가벼운 마음으로 가봐.`;
    return null;
  }

  if (ctx.from === "whatToEat" && ctx.food) {
    const pName = place.name || "";
    if (pName.includes("맛집")) return `${ctx.food.name} 맛집 검색하고 가봐. 후기 좋은 데 많아.`;
    if (pName.includes("시장")) return `시장에서 먹는 ${ctx.food.name}은 또 다른 맛이야.`;
    if (pName.includes("포장마차") || pName.includes("야시장")) return `밤에 여기서 먹으면 분위기까지 맛있어.`;
    if (pName.includes("푸드코트")) return `같이 온 사람이랑 각자 먹고 싶은 거 시켜도 돼.`;
    if (pName.includes("카페")) return `${ctx.food.name} 먹고 후식으로 커피 한 잔까지.`;
    return `${ctx.food.name} 먹기 좋은 분위기야.`;
  }

  return null;
}

// 추천 이유 생성
function buildReason(pa, ctx, curSlot) {
  const reasons = [];
  if (ctx?.from === "whatToDo") {
    if (isHomeActivity(ctx.activity)) {
      reasons.push(`${ctx.activity?.emoji || "✨"} ${ctx.activity?.name} 하면서 잠깐 들르기 좋은 곳`);
    } else {
      reasons.push(`${ctx.activity?.emoji || "✨"} ${ctx.activity?.name} 하기 좋은 곳`);
    }
  } else if (ctx?.from === "whatToEat") {
    reasons.push(`${ctx.food?.emoji || "🍽️"} ${ctx.food?.name || "맛집"} 먹으러`);
  } else {
    const moodLabel = { chill:"조용히 쉬고 싶을 때", active:"활동적으로 놀 때", romantic:"감성 충전" };
    if (pa?.mood && moodLabel[pa.mood]) reasons.push(moodLabel[pa.mood]);
  }
  const slotLabel = { morning:"아침", afternoon:"오후", evening:"저녁", night:"늦은 밤" };
  reasons.push(slotLabel[curSlot] + " 시간대");
  const whoLabel = { alone:"혼자", partner:"연인과 함께", family:"가족과 함께", friend:"친구와 함께" };
  if (pa?.who && whoLabel[pa.who]) reasons.push(whoLabel[pa.who]);
  return reasons.join(" · ");
}

/**
 * 장소 추천 (스코어 기반)
 * @param {Object} pa - 사용자 답변 { who, inOut, budget, mood }
 * @param {Object|null} ctx - 탭 간 연결 context { from, activity?, food? }
 * @returns {{ main, alternatives, reason }}
 */
export function recommendPlace(pa, ctx) {
  const curSlot = getCurrentSlot();

  // 하드 필터
  const filtered = filterPlaces(pa, curSlot, true);
  const pool = filtered.length >= 3
    ? filtered
    : filterPlaces(pa, curSlot, false); // 시간대 필터 제거하고 재시도

  // 스코어링
  const scored = scorePlaces(pool, pa, ctx, curSlot);

  const mainPlace = scored[0]?.place;
  return {
    main: mainPlace,
    alternatives: scored.slice(1, 4).map(s => s.place),
    reason: buildReason(pa, ctx, curSlot),
    connectionReason: mainPlace ? buildConnectionReason(mainPlace, ctx) : null,
  };
}

/**
 * 토너먼트용 bracket 생성 (상위 24개 → 셔플 → 16개)
 * @param {Object} pa - 사용자 답변
 * @param {Object|null} ctx - 탭 간 연결 context
 * @returns {Array} 16개 장소 bracket
 */
export function buildTournamentBracket(pa, ctx, bracketSize = 16) {
  const curSlot = getCurrentSlot();
  const moodVibes = PLACE_MOOD_VIBES[pa?.mood] || [];

  const filtered = filterPlaces(pa, curSlot, true);
  const pool = filtered.length >= 8 ? filtered : places;

  // 토너먼트용 스코어링 (추천보다 낮은 가중치)
  const scored = pool.map(p => {
    let score = 0;
    if (moodVibes.length > 0) score += p.vibe.filter(v => moodVibes.includes(v)).length * 3;
    if (p.timeSlots?.includes(curSlot)) score += 2;
    if (pa?.who && p.withWho?.includes(pa.who)) score += 2;
    if (pa?.budget && p.budget?.includes(pa.budget)) score += 1;
    if (ctx?.from === "whatToDo" && ctx.activity) {
      const homeAct = isHomeActivity(ctx.activity);
      if (homeAct) {
        const homeType = getHomeActivityType(ctx.activity);
        const homePlaces = HOME_ACTIVITY_PLACES_BY_TYPE[homeType] || HOME_ACTIVITY_PLACES_BY_TYPE.default;
        const nameMatch = homePlaces.names.some(n => p.name?.includes(n));
        const tagMatch = homePlaces.tags.some(t => p.tags?.includes(t));
        if (nameMatch) score += 12;
        else if (tagMatch) score += 6;
        else score -= 8;
      } else {
        if (ctx.activity.vibe) score += p.vibe.filter(v => ctx.activity.vibe.includes(v)).length * 2;
        const genreMap = GENRE_PLACE_MAP[ctx.activity.genre];
        if (genreMap) {
          const nameMatch = genreMap.names?.some(n => p.name?.includes(n));
          const tagMatch = genreMap.tags?.some(t => p.tags?.includes(t));
          const typeMatch = genreMap.types?.some(t => p.type?.includes(t));
          if (nameMatch) score += 10;
          else if (tagMatch || typeMatch) score += 6;
          else score -= 6;
        }
      }
    }
    if (ctx?.from === "whatToEat") {
      const foodPlaceNames = ["맛집 탐방","고깃집","분식집","회전초밥","찜닭골목","포장마차/야시장",
        "푸드코트","한강 치맥","오션뷰 맛집","전통시장","브런치 카페","편의점 앞 벤치"];
      const foodTags = ["맛집","먹방","먹거리","카페","브런치","디저트","길거리음식","먹자골목"];
      const foodTypes = ["cafe","restaurant","market","bar"];
      const isFoodPlace = foodPlaceNames.some(n => p.name?.includes(n))
        || foodTypes.some(t => p.type?.includes(t))
        || p.tags?.some(t => foodTags.includes(t));
      if (isFoodPlace) score += 8;
      if (!isFoodPlace) score -= 4;
    }
    score += Math.random() * 1;
    return { ...p, score };
  }).sort((a, b) => b.score - a.score);

  const topN = Math.min(bracketSize + 8, scored.length);
  return [...scored.slice(0, topN)].sort(() => Math.random() - 0.5).slice(0, bracketSize);
}

// PLACE_MOOD_VIBES export (혹시 외부에서 필요할 때)
export { PLACE_MOOD_VIBES };
