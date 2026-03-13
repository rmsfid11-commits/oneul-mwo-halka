import { useState, useEffect, useRef } from "react";
import { activities as ACTIVITIES } from './data/activities.js';
import { buildCoursePlans, extractChampion } from './features/whatToDo/courseBuilder.js';
import { foods } from './data/foods.js';
import { recommendFood } from './features/whatToEat/engine.js';
import { places } from './data/places.js';
import { supabase } from './lib/supabase.js';

const S = {
  screen: { maxWidth:480, margin:"0 auto", padding:"24px 20px 80px" },
  sectionTag: { display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:"1.5px", color:"#888", textTransform:"uppercase", marginBottom:6 },
  qCard: { background:"#fff", borderRadius:20, padding:20, marginBottom:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  qLabel: { fontSize:17, fontWeight:700, marginBottom:14, color:"#191919" },
  optRow: { display:"flex", flexDirection:"column", gap:8 },
  optBtn: (selected) => ({ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderRadius:14, border: selected ? "1.5px solid #191919" : "1.5px solid #ECEAE4", background: selected ? "#191919" : "#FAFAF8", cursor:"pointer", transition:"all 0.18s", fontFamily:"inherit", width:"100%" }),
  optLabel: (selected) => ({ fontSize:15, fontWeight:500, color: selected ? "#fff" : "#191919" }),
  startBtn: (disabled) => ({ width:"100%", padding:17, background: disabled ? "#D0CEC8" : "#191919", color: disabled ? "#999" : "#fff", border:"none", borderRadius:16, fontSize:16, fontWeight:800, cursor: disabled ? "default" : "pointer", fontFamily:"inherit", marginTop:24 }),
};

// ─── 활동 데이터: src/data/activities.js에서 import ─────────────────

// ─── 질문 구조 ────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "need", section: "지금 상태", label: "지금 기분이 어때?",
    options: [
      { value:"힐링", label:"🌿 지쳐서 쉬고 싶어", subLabel:"어떻게 쉬고 싶어?", maxSubs:2, subs:[
        { value:"고요함", label:"조용히 아무것도 안 하고 싶어" },
        { value:"따뜻함", label:"따뜻하거나 감각적인 게 필요해" },
        { value:"감성충전", label:"감성적인 걸 보거나 듣고 싶어" },
        { value:"몸회복", label:"몸이 피곤해서 회복이 필요해" },
      ]},
      { value:"성취감", label:"🏆 뭔가 해내고 싶어", subLabel:"어떤 성취?", maxSubs:2, subs:[
        { value:"정리정돈", label:"지저분한 걸 정리하고 싶어" },
        { value:"완성하는기쁨", label:"뭔가 만들거나 완성하고 싶어" },
        { value:"지적자극", label:"배우거나 성장하는 느낌" },
        { value:"뿌듯함", label:"땀 흘리고 뿌듯한 느낌" },
      ]},
      { value:"자극", label:"⚡ 재미나 자극이 필요해", subLabel:"어떤 자극?", maxSubs:2, subs:[
        { value:"웃음", label:"그냥 웃고 싶어" },
        { value:"두근거림", label:"두근거리거나 짜릿한 게 필요해" },
        { value:"새로운경험", label:"새로운 걸 경험해보고 싶어" },
        { value:"도전", label:"뭔가에 도전하고 싶어" },
      ]},
      { value:"멍때리기", label:"😶 아무것도 하기 싫어", subLabel:"어느 정도?", maxSubs:1, subs:[
        { value:"수동적소비", label:"재밌는 거 보여주면 봄, 고르기는 싫어" },
        { value:"아무생각없이", label:"그냥 틀어만 놓고 싶어" },
        { value:"자연감성", label:"자연 속에서 멍때리고 싶어" },
      ]},
    ]
  },
  {
    id: "alone", section: "환경", label: "오늘 사람이 필요해?",
    options: [
      { value:"혼자", label:"🙋 혼자", subLabel:"어떤 혼자?", maxSubs:2, subs:[
        { value:"혼자만의시간", label:"완전 나만의 시간" },
        { value:"익명의공간", label:"카페 같은 익명 공간은 괜찮아" },
        { value:"기다리는맛", label:"혼자 조용히 기다리는 게 좋아 (낚시 등)" },
      ]},
      { value:"강아지랑", label:"🐕 강아지랑만", subLabel:"", maxSubs:0, subs:[] },
      { value:"같이", label:"👥 누군가랑", subLabel:"누구랑?", maxSubs:1, subs:[
        { value:"친구", label:"👯 친한 친구" },
        { value:"연인", label:"💑 연인" },
        { value:"가족", label:"👨‍👩‍👧 가족" },
        { value:"동료", label:"🤝 동료 / 지인" },
      ]},
    ]
  },
  {
    id: "location", section: "환경", label: "밖에 나갈 수 있어?",
    options: [
      { value:"home", label:"🏠 집에 있을 거야", subLabel:"", maxSubs:0, subs:[] },
      { value:"out", label:"🚶 나갈 수 있어", subLabel:"얼마나?", maxSubs:1, subs:[
        { value:"동네", label:"동네 근처만" },
        { value:"드라이브", label:"차 타고 어디든" },
        { value:"자연", label:"자연 / 바다 / 산까지" },
      ]},
    ]
  },
  {
    id: "cost", section: "환경", label: "오늘 돈 써도 돼?",
    options: [
      { value:"무료", label:"🆓 0원으로", subLabel:"", maxSubs:0, subs:[] },
      { value:"조금", label:"💸 조금은", subLabel:"", maxSubs:0, subs:[] },
      { value:"상관없어", label:"💳 상관없어", subLabel:"", maxSubs:0, subs:[] },
    ]
  },
  {
    id: "hours", section: "시간", label: "얼마나 있어?", type: "slider",
    options: []
  },
];




// ─── 계절 필터 ────────────────────────────────────────────
const SEASONAL_ACTIVITIES = {
  150: [12, 1, 2],     // 눈 오는 날 산책 → 겨울
  74: [5, 6, 7, 8, 9], // 스노클링 → 여름
  78: [5, 6, 7, 8, 9], // 수상 스키 / 웨이크보드 → 여름
  79: [5, 6, 7, 8, 9], // 래프팅 → 여름
};

// ─── 음식 추천 질문 ────────────────────────────────────────
const FOOD_QUESTIONS = [
  {
    id: "mood", label: "지금 뭐가 먹고 싶어?",
    options: [
      { value: "든든", label: "🍖 든든하게" },
      { value: "가벼운", label: "🥗 가볍게" },
      { value: "자극적", label: "🌶️ 매콤 자극" },
      { value: "위로", label: "🤗 위로음식" },
      { value: "특별한", label: "✨ 특별하게" },
    ]
  },
  {
    id: "withWho", label: "누구랑 먹어?",
    options: [
      { value: "alone", label: "🙋 혼자" },
      { value: "friend", label: "👫 친구" },
      { value: "partner", label: "💑 연인" },
      { value: "family", label: "👨‍👩‍👧 가족" },
    ]
  },
  {
    id: "budget", label: "가격대는?",
    options: [
      { value: "low", label: "💰 가성비" },
      { value: "mid", label: "💳 적당히" },
      { value: "high", label: "💎 좀 쓸게" },
    ]
  },
];

const FOOD_CATS = [
  { key: "all", label: "전체", emoji: "🍽️" },
  { key: "한식", label: "한식", emoji: "🇰🇷" },
  { key: "일식", label: "일식", emoji: "🇯🇵" },
  { key: "양식", label: "양식", emoji: "🍝" },
  { key: "분식", label: "분식", emoji: "🌶️" },
  { key: "기타", label: "기타", emoji: "🌍" },
];

function getFoodTimeSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return "breakfast";
  if (h >= 10 && h < 14) return "lunch";
  if (h >= 14 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "dinner";
  return "latenight";
}

// ─── 매칭 로직 ────────────────────────────────────────────
function matchActivities(answers) {
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
    if (answers.location === "home" && !t.location.includes("home")) return null;
    if (answers.alone === "혼자"    && t.alone.length === 1 && t.alone[0] === "같이") return null;
    if (answers.alone === "같이"    && t.alone.length === 1 && (t.alone[0] === "혼자" || t.alone[0] === "강아지랑")) return null;
    if (answers.alone === "강아지랑" && !t.alone.includes("강아지랑")) return null;
    if (act.time > answers.hours * 60) return null;
    // 시간대: 토너먼트는 취향 발견용이므로 감점만 (코스 빌더에서 하드 필터)
    const currentSlot = getTimeSlot();
    const timeSlotMismatch = act.timeSlots && act.timeSlots.length > 0 && !act.timeSlots.includes(currentSlot);
    if (answers.cost === "무료" && !t.cost.includes("무료")) return null;
    if (answers.blacklistGenres?.includes(act.genre)) return null;
    // 계절 필터
    const currentMonth = new Date().getMonth() + 1;
    if (SEASONAL_ACTIVITIES[act.id] && !SEASONAL_ACTIVITIES[act.id].includes(currentMonth)) return null;
    const fishingIds = [70,71,72,73];
    const waterSportIds = [74,75,76,77,78,79,80];
    if (answers.blacklistGenres?.includes("fishing") && fishingIds.includes(act.id)) return null;
    if (answers.blacklistGenres?.includes("watersport") && waterSportIds.includes(act.id)) return null;

    // 시간대 불일치 감점 (토너먼트에서 뒤로 밀림)
    if (timeSlotMismatch) score -= 10;

    // 기본 스코어
    if (answers.need && t.need.includes(answers.need)) score += 5;
    if (t.location.includes(answers.location)) score += 2;
    if (answers.cost && t.cost.includes(answers.cost)) score += 1;

    // 같이 모드 보너스
    if (answers.alone === "같이" && togetherWith) {
      if (togetherGenreBonus[togetherWith]?.includes(act.genre)) score += 3;
    }

    // vibe 직접 매칭 — 서브 선택값이 활동 vibe와 일치할 때
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
    const VIBE_KO = {
      고요함:"고요함",따뜻함:"따뜻함",아무생각없이:"아무 생각 없이",느리게:"천천히",몸회복:"몸 회복",
      감성충전:"감성 충전",수동적소비:"수동적 소비",혼자만의시간:"혼자만의 시간",
      뿌듯함:"뿌듯함",완성하는기쁨:"완성의 기쁨",지적자극:"지적 자극",정리정돈:"정리정돈",
      두근거림:"두근거림",새로운경험:"새로운 경험",도전:"도전",웃음:"웃음",
      자연감성:"자연 감성",기다리는맛:"기다리는 맛",야간감성:"밤 감성",자유로움:"자유로움",
      소소한사치:"소소한 사치",집중:"집중",땀흘리기:"땀 흘리기",같이하면더좋은:"함께",
      맛탐험:"맛 탐험",따뜻함:"따뜻함",충전:"충전",비우는기쁨:"비우는 기쁨",리셋:"리셋",
    };
    const reasonParts = [...new Set(matchedVibes.slice(0,2))].map(v => VIBE_KO[v] || v);
    const reason = reasonParts.length
      ? `네가 ${reasonParts.join(" + ")} 고른 거랑 잘 맞아`
      : answers.need === "멍때리기" ? "뭔가 틀어놓기만 해도 되는 거야"
      : answers.need === "성취감" ? "오늘 뭔가 해낸 느낌 줄 수 있어"
      : "지금 네 상태에 잘 맞는 것 같아";

    return { ...act, score, reason };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}


// ─── 일정 순서 로직 ──────────────────────────────────────
function getTimeSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

function getActivityWeight(act) {
  let w = 0;
  if (act.tags.energy.includes("high")) w += 3;
  else if (act.tags.energy.includes("mid")) w += 2;
  else w += 1;
  const activeGenres = ["water","mountain","sport","fitness","cycling"];
  if (activeGenres.includes(act.genre)) w += 2;
  if (act.tags.need?.includes("성취감")) w += 1;
  return w;
}

function getCategory(act) {
  if (act.tags.need?.includes("성취감")) return "productive";
  if (act.tags.need?.includes("자극")) return "stimulate";
  if (act.tags.need?.includes("멍때리기")) return "passive";
  return "healing";
}

function sortSchedule(items, timeSlot) {
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

// ─── 메인 컴포넌트 ────────────────────────────────────────
export default function VibeApp() {
  const [tab, setTab] = useState("whatToDo"); // whatToDo | whatToEat | whereToGo
  const [screen, setScreen] = useState("onboarding"); // onboarding | setup | tournament | result
  const [answers, setAnswers] = useState({ need:"", alone:"", location:"", cost:"", hours:2, subs:{}, preferredVibes:[], blacklistGenres:[] });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: 좋아하는 vibe, 1: 블랙리스트
  const [tempVibes, setTempVibes] = useState([]);
  const [tempBlacklist, setTempBlacklist] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [matched, setMatched] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [matchIdx, setMatchIdx] = useState(0);
  const [roundWinners, setRoundWinners] = useState([]);
  const [champion, setChampion] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [picking, setPicking] = useState(null);
  const [mySchedule, setMySchedule] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [flipped, setFlipped] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [champFlipped, setChampFlipped] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [challengeMode, setChallengeMode] = useState(false);
  const [championPick, setChampionPick] = useState(null);
  const timeSlot = getTimeSlot();

  // ── 코스 피드백 ──
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const FEEDBACK_REASONS = [
    { id:"combo", emoji:"🔀", label:"조합이 이상해" },
    { id:"time", emoji:"⏰", label:"시간이 안 맞아" },
    { id:"flow", emoji:"🏠", label:"동선이 비현실적" },
    { id:"boring", emoji:"😴", label:"재미없어 보여" },
    { id:"other", emoji:"🤔", label:"기타" },
  ];
  async function sendFeedback(reasonId) {
    if (!selectedCourse) return;
    const report = {
      reason: reasonId,
      course_title: selectedCourse.title,
      activities: mySchedule.map(a => ({ id:a.id, name:a.name, genre:a.genre, duration:a.duration||a.time })),
      total_minutes: mySchedule.reduce((s,a) => s + (a.duration||a.time), 0),
      user_answers: { need:answers.need, alone:answers.alone, location:answers.location, cost:answers.cost, hours:answers.hours },
    };
    // Supabase에 저장 시도, 실패하면 localStorage 폴백
    try {
      await supabase.from("course_feedback").insert(report);
    } catch {
      const saved = JSON.parse(localStorage.getItem("course_feedback") || "[]");
      saved.push({ ...report, ts: new Date().toISOString() });
      localStorage.setItem("course_feedback", JSON.stringify(saved));
    }
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedbackOpen(false); }, 1500);
  }

  // ── 장소 탭 상태 ──
  const [placeScreen, setPlaceScreen] = useState("home"); // home | result
  const [placeResult, setPlaceResult] = useState(null); // { main, alternatives }

  const PLACE_MOODS = [
    { id:"chill", emoji:"😌", label:"조용히 쉬고 싶어", vibes:["고요함","힐링","평화로움","느긋함","편안한"] },
    { id:"active", emoji:"⚡", label:"활동적으로 놀래", vibes:["활동적","신나는","재미","해방감"] },
    { id:"romantic", emoji:"💕", label:"감성 충전", vibes:["감성","로맨틱","특별함","영감","지적"] },
    { id:"random", emoji:"🎲", label:"아무데나 골라줘", vibes:[] },
  ];

  function recommendPlace(moodId) {
    const mood = PLACE_MOODS.find(m => m.id === moodId);
    const hour = new Date().getHours();
    const curSlot = hour < 6 ? "night" : hour < 11 ? "morning" : hour < 14 ? "afternoon" : hour < 18 ? "afternoon" : hour < 21 ? "evening" : "night";

    // 온보딩 답변 → 장소 데이터 매핑
    const whoMap = { "혼자":"alone", "같이":"friend", "강아지랑":"alone" };
    const userWho = whoMap[answers.alone] || null;
    // 같이인 경우 세부 선택 확인
    const togetherWith = answers.subs?.alone?.[0] || null;
    const whoKey = togetherWith === "연인" ? "partner" : togetherWith === "가족" ? "family" : userWho;

    const budgetMap = { "무료":"low", "저렴":"low", "유료OK":"mid" };
    const userBudget = budgetMap[answers.cost] || null;

    const isOutdoorOk = answers.location !== "home";
    const isIndoorOk = answers.location !== "out";

    // 1단계: 하드 필터
    const filtered = places.filter(p => {
      // 시간대 필터: 해당 시간에 갈 수 없는 곳 제외
      if (p.timeSlots && !p.timeSlots.includes(curSlot)) return false;
      // 장소 타입 필터: 실내/실외
      if (!isOutdoorOk && p.type.includes("outdoor") && !p.type.includes("indoor")) return false;
      if (!isIndoorOk && p.type.includes("indoor") && !p.type.includes("outdoor")) return false;
      // withWho 필터: 혼자인데 혼자 못 가는 곳 제외
      if (whoKey === "alone" && p.withWho && !p.withWho.includes("alone")) return false;
      return true;
    });

    // 필터 결과 부족하면 시간대 필터만 완화
    const pool = filtered.length >= 3 ? filtered : places.filter(p => {
      if (whoKey === "alone" && p.withWho && !p.withWho.includes("alone")) return false;
      return true;
    });

    // 2단계: 스코어링
    const scored = pool.map(p => {
      let score = 0;

      // 분위기 매칭 (핵심) +4 per match
      if (mood && mood.vibes.length > 0) {
        const matchCount = p.vibe.filter(v => mood.vibes.includes(v)).length;
        score += matchCount * 4;
      }

      // 시간대 매칭 +3
      if (p.timeSlots && p.timeSlots.includes(curSlot)) score += 3;

      // withWho 매칭 +3
      if (whoKey && p.withWho && p.withWho.includes(whoKey)) score += 3;

      // budget 매칭 +2
      if (userBudget && p.budget && p.budget.includes(userBudget)) score += 2;

      // 밤에 야외 활동 페널티
      if ((curSlot === "night") && p.type.includes("outdoor") && !p.type.includes("drive") && !["야경 스팟"].includes(p.name)) score -= 2;

      // 비 올 때 야외 페널티 (나중에 날씨 API 연동 가능)
      // 혼자인데 "데이트" 태그 있으면 페널티
      if (whoKey === "alone" && p.tags.some(t => t.includes("데이트"))) score -= 2;

      // 연인이면 로맨틱 보너스
      if (whoKey === "partner" && p.vibe.includes("로맨틱")) score += 3;

      // 가족이면 활동적/자유로운 보너스
      if (whoKey === "family" && p.vibe.some(v => ["활동적","자유로운","평화로움"].includes(v))) score += 2;

      // 약간의 랜덤성 (0~1.5)
      score += Math.random() * 1.5;

      return { place: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const main = scored[0]?.place;
    const alts = scored.slice(1, 4).map(s => s.place);

    // 추천 이유 생성
    const reasons = [];
    if (mood && mood.id !== "random") reasons.push(mood.label);
    if (curSlot === "morning") reasons.push("아침 시간대");
    else if (curSlot === "afternoon") reasons.push("오후 시간대");
    else if (curSlot === "evening") reasons.push("저녁 시간대");
    else if (curSlot === "night") reasons.push("늦은 밤");
    if (whoKey === "alone") reasons.push("혼자");
    else if (whoKey === "partner") reasons.push("연인과 함께");
    else if (whoKey === "family") reasons.push("가족과 함께");
    else if (whoKey === "friend") reasons.push("친구와 함께");

    setPlaceResult({ main, alternatives: alts, moodId, reason: reasons.join(" · ") });
    setPlaceScreen("result");
  }

  // ── 음식 탭 상태 ──
  const [foodScreen, setFoodScreen] = useState("home"); // home | questions | result | roulette
  const [foodStep, setFoodStep] = useState(0);
  const [foodAnswers, setFoodAnswers] = useState({});
  const [foodResult, setFoodResult] = useState(null);
  const [rouletteCat, setRouletteCat] = useState("all");
  const [rouletteFood, setRouletteFood] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState(null);
  const [flippedFoods, setFlippedFoods] = useState(new Set());
  const spinRef = useRef(null);

  function toggleFoodFlip(id) {
    setFlippedFoods(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  useEffect(() => { return () => { if (spinRef.current) clearTimeout(spinRef.current); }; }, []);

  function startRoulette() {
    const pool = rouletteCat === "all" ? foods
      : rouletteCat === "기타" ? foods.filter(f => !["한식","일식","양식","분식"].some(c => f.category.includes(c)))
      : foods.filter(f => f.category.includes(rouletteCat));
    if (pool.length === 0) return;
    setSpinning(true);
    setRouletteFood(null);
    let count = 0;
    const maxCount = 20 + Math.floor(Math.random() * 10);
    const finalIdx = Math.floor(Math.random() * pool.length);
    const tick = () => {
      count++;
      setSpinDisplay(pool[count % pool.length]);
      if (count >= maxCount) {
        setSpinDisplay(pool[finalIdx]);
        setRouletteFood(pool[finalIdx]);
        setSpinning(false);
        return;
      }
      const delay = count < maxCount - 8 ? 80 : 80 + (count - (maxCount - 8)) * 40;
      spinRef.current = setTimeout(tick, delay);
    };
    tick();
  }

  // ── 피드백 누적 (온보딩 B) ──
  function saveFeedback(chosenActivities) {
    try {
      const prev = JSON.parse(localStorage.getItem("vibe_feedback") || "{}");
      chosenActivities.forEach(act => {
        (act.vibe || []).forEach(v => {
          prev[v] = (prev[v] || 0) + 1;
        });
      });
      localStorage.setItem("vibe_feedback", JSON.stringify(prev));

      // 상위 5개 vibe 자동으로 preferredVibes에 반영
      const sorted = Object.entries(prev).sort((a,b) => b[1]-a[1]).slice(0,5).map(e=>e[0]);
      const prefs = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
      prefs.learnedVibes = sorted;
      localStorage.setItem("vibe_prefs", JSON.stringify(prefs));
    } catch {}
  }

  function getLearnedVibes() {
    try {
      const prefs = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
      return prefs.learnedVibes || [];
    } catch { return []; }
  }
  function getHistory() {
    try { return JSON.parse(localStorage.getItem("vibe_history") || "[]"); } catch { return []; }
  }
  function addHistory(ids) {
    try {
      const prev = getHistory();
      const next = [...new Set([...ids, ...prev])].slice(0, 30);
      localStorage.setItem("vibe_history", JSON.stringify(next));
    } catch {}
  }
  function clearHistory() {
    try { localStorage.removeItem("vibe_history"); } catch {}
  }

  // ── 시간대 보너스 ──
  function getTimeBonus(act) {
    const h = new Date().getHours();
    const g = act.genre;
    if (h >= 6  && h < 10) { // 아침
      if (["nature","fitness","cooking"].includes(g)) return 2;
    }
    if (h >= 18 && h < 21) { // 저녁
      if (["cooking","social","culture"].includes(g)) return 2;
    }
    if (h >= 21 || h < 2) { // 밤
      if (["healing","culture","art"].includes(g)) return 2;
      if (["water","mountain","sport"].includes(g)) return -3;
    }
    return 0;
  }

  const canStart = answers.need && answers.alone && answers.location && answers.cost;
  const missing = ["need","alone","location","cost"].filter(k => !answers[k]);

  function toggleExpand(qid, val) {
    const key = `${qid}_${val}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  }

  function selectSub(qid, val, maxSubs) {
    setAnswers(a => {
      const cur = a.subs[qid] || [];
      const already = cur.includes(val);
      let next;
      if (already) {
        next = cur.filter(v => v !== val);
      } else if (cur.length >= (maxSubs || 1)) {
        next = [...cur.slice(1), val];
      } else {
        next = [...cur, val];
      }
      return { ...a, subs: { ...a.subs, [qid]: next } };
    });
  }

  function selectOption(qid, val) {
    setAnswers(a => ({ ...a, [qid]: val }));
  }

  // 에너지 서브 선택에 따라 동적으로 서브옵션 추가
  function getDynamicSubs(qid, optValue, baseSubs) {
    return baseSubs;
  }

  function startTournament(isChallenge = false) {
    const history = getHistory();
    const learnedVibes = getLearnedVibes();
    // learned vibes를 preferredVibes에 합쳐서 매칭
    const enrichedAnswers = {
      ...answers,
      preferredVibes: [...new Set([...(answers.preferredVibes || []), ...learnedVibes])]
    };
    let m = matchActivities(enrichedAnswers);

    // 시간대 보너스 반영
    m = m.map(act => ({ ...act, score: (act.score || 0) + getTimeBonus(act) }))
         .sort((a, b) => b.score - a.score);

    // 도전 모드: 히스토리에 없는 것만
    if (isChallenge) {
      const fresh = m.filter(act => !history.includes(act.id));
      m = fresh.length >= 8 ? fresh : m; // 8개 미만이면 그냥 전체
    } else {
      // 일반 모드: 최근 나온 것들 뒤로 밀기
      m = m.sort((a, b) => {
        const aNew = history.includes(a.id) ? 1 : 0;
        const bNew = history.includes(b.id) ? 1 : 0;
        return aNew - bNew || b.score - a.score;
      });
    }

    setMatched(m);
    const pool = [...m.slice(0, 14)].sort(() => Math.random() - 0.5).slice(0, 8);
    setBracket(pool);
    setMatchIdx(0);
    setRoundWinners([]);
    setChampion(null);
    setChallengeMode(isChallenge);
    setScreen("tournament");
  }

  function pickWinner(winner, side) {
    setPicking(side);
    setTournamentHistory(h => [...h, winner]);
    setTimeout(() => {
      setPicking(null);
      const newWinners = [...roundWinners, winner];
      const nextIdx = matchIdx + 2;

      if (nextIdx >= bracket.length) {
        // 라운드 끝
        if (newWinners.length === 1) {
          // 챔피언 결정
          setChampion(newWinners[0]);

          const initialSchedule = [newWinners[0]];
          setMySchedule(initialSchedule);
          // 히스토리 저장
          addHistory(bracket.map(a => a.id));
          // 피드백 누적 (내가 고른 것들의 vibe 패턴 학습)
          saveFeedback([...tournamentHistory, newWinners[0]]);
          // 추천 카드: 챔피언 제외 상위 6개
          const suggs = [];
          for (const act of matched.filter(a => a.id !== newWinners[0].id)) {
            if (suggs.length >= 6) break;
            suggs.push(act);
          }
          setSuggestions(suggs);

          // 코스 빌더: 챔피언 기반 코스 3개 생성
          try {
            const coursePrefs = {
              need: answers.need, alone: answers.alone,
              location: answers.location, cost: answers.cost,
              subs: answers.subs, hours: answers.hours,
              preferredVibes: answers.preferredVibes,
              blacklistGenres: answers.blacklistGenres,
              timeSlot: getTimeSlot(),
            };
            const plans = buildCoursePlans(ACTIVITIES, coursePrefs, newWinners[0].id);
            // 챔피언이 포함된 코스를 우선 정렬
            plans.sort((a, b) => {
              const aHas = a.activities.some(act => act.id === newWinners[0].id) ? 1 : 0;
              const bHas = b.activities.some(act => act.id === newWinners[0].id) ? 1 : 0;
              return bHas - aHas;
            });
            setCourses(plans);
            setSelectedCourse(null);

            // extractChampion — 오늘의 픽 계산
            const _cpResult = extractChampion(plans, {
              need: answers.need, subs: answers.subs, alone: answers.alone,
            });
            setChampionPick(_cpResult);
          } catch { setCourses([]); }

          setScreen("result");
        } else {
          // 다음 라운드
          setBracket(newWinners);
          setMatchIdx(0);
          setRoundWinners([]);
        }
      } else {
        setMatchIdx(nextIdx);
        setRoundWinners(newWinners);
      }
    }, 400);
  }

  const pair = bracket.slice(matchIdx, matchIdx + 2);
  const totalMatches = bracket.length / 2;
  const currentMatch = Math.floor(matchIdx / 2) + 1;

  return (
    <div style={{ minHeight:"100vh", background:"#F5F4F0", fontFamily:"'Noto Sans KR', sans-serif", color:"#191919", paddingBottom: screen === "result" ? 80 : 0 }}>

      {/* ── 뭐 할까 탭 ── */}
      {tab === "whatToDo" && (<>

      {/* ── 온보딩 화면 ── */}
      {screen === "onboarding" && (() => {
        const VIBE_OPTIONS = [
          { value:"고요함",        emoji:"🤫", label:"고요하게" },
          { value:"두근거림",      emoji:"💓", label:"두근두근" },
          { value:"땀흘리기",      emoji:"💪", label:"땀 흘리기" },
          { value:"감성충전",      emoji:"🎨", label:"감성 충전" },
          { value:"완성하는기쁨",  emoji:"✅", label:"완성의 기쁨" },
          { value:"자연감성",      emoji:"🌿", label:"자연 속에서" },
          { value:"소소한사치",    emoji:"✨", label:"소소한 사치" },
          { value:"지적자극",      emoji:"🧠", label:"머리 쓰기" },
          { value:"같이하면더좋은",emoji:"👥", label:"누군가랑" },
          { value:"혼자만의시간",  emoji:"🙋", label:"혼자만의 시간" },
          { value:"새로운경험",    emoji:"🗺️", label:"새로운 경험" },
          { value:"아무생각없이",  emoji:"😶", label:"멍때리기" },
          { value:"야간감성",      emoji:"🌙", label:"밤 감성" },
          { value:"기다리는맛",    emoji:"🎣", label:"기다리는 맛" },
          { value:"도전",          emoji:"🔥", label:"도전" },
          { value:"자유로움",      emoji:"🪁", label:"자유롭게" },
        ];
        const BLACKLIST_OPTIONS = [
          { value:"fishing",  emoji:"🎣", label:"낚시" },
          { value:"watersport",emoji:"🏄", label:"수상스포츠" },
          { value:"mountain", emoji:"⛰️", label:"등산" },
          { value:"sport",    emoji:"⚽", label:"팀스포츠" },
          { value:"camp",     emoji:"⛺", label:"캠핑" },
          { value:"social",   emoji:"🎤", label:"노래방 / 술" },
          { value:"craft",    emoji:"🏺", label:"공방" },
          { value:"beauty",   emoji:"💅", label:"뷰티" },
          { value:"game",     emoji:"🎮", label:"게임" },
          { value:"cooking",  emoji:"🍳", label:"요리" },
          { value:"fitness",  emoji:"🏋️", label:"헬스 / 홈트" },
          { value:"learn",    emoji:"📚", label:"강의 / 공부" },
          { value:"digital",  emoji:"💻", label:"코딩 / 작업" },
        ];

        const isFirstRun = !localStorage.getItem("vibe_onboarded");
        if (!isFirstRun) {
          setTimeout(() => {
            const saved = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
            setAnswers(a => ({ ...a, preferredVibes: saved.vibes || [], blacklistGenres: saved.blacklist || [] }));
            setScreen("setup");
          }, 0);
          return null;
        }

        const btnStyle = (selected, isBlack) => ({
          width:"100%", aspectRatio:"1", borderRadius:16, display:"flex",
          flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:3, border: selected
            ? `2px solid ${isBlack ? "#191919" : "#FF4444"}`
            : "1.5px solid #E0DED8",
          background: selected ? (isBlack ? "#191919" : "#FFF0F0") : "#fff",
          color: selected ? (isBlack ? "#fff" : "#CC0000") : "#555",
          fontSize:10, fontWeight:700, cursor:"pointer",
          fontFamily:"inherit", transition:"all 0.15s", padding:0,
        });

        return (
          <div className="screen fade-in" style={{ paddingBottom:32 }}>
            <div style={{ marginBottom:20, paddingTop:8 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:2, marginBottom:8 }}>처음 오셨군요 👋</div>
              <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.5px", lineHeight:1.3 }}>취향 2가지만 알려줘</div>
              <div style={{ fontSize:12, color:"#999", marginTop:4 }}>더 정확한 추천을 위해. 나중에 바꿀 수 있어.</div>
            </div>

            <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"#333" }}>
              좋아하는 느낌 <span style={{color:"#aaa",fontWeight:500,fontSize:11}}>(최대 5개)</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:24 }}>
              {VIBE_OPTIONS.map(v => {
                const sel = tempVibes.includes(v.value);
                return (
                  <button key={v.value} onClick={() =>
                    setTempVibes(p => p.includes(v.value)
                      ? p.filter(x=>x!==v.value)
                      : p.length < 5 ? [...p, v.value] : p)
                  } style={btnStyle(sel, true)}>
                    <span style={{fontSize:20}}>{v.emoji}</span>
                    <span style={{lineHeight:1.2,textAlign:"center",padding:"0 2px"}}>{v.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"#333" }}>
              절대 안 하는 것 <span style={{color:"#aaa",fontWeight:500,fontSize:11}}>(추천에서 제외)</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:28 }}>
              {BLACKLIST_OPTIONS.map(v => {
                const sel = tempBlacklist.includes(v.value);
                return (
                  <button key={v.value} onClick={() =>
                    setTempBlacklist(p => p.includes(v.value)
                      ? p.filter(x=>x!==v.value) : [...p, v.value])
                  } style={btnStyle(sel, false)}>
                    <span style={{fontSize:20}}>{v.emoji}</span>
                    <span style={{lineHeight:1.2,textAlign:"center",padding:"0 2px"}}>{v.label}</span>
                  </button>
                );
              })}
            </div>

            <button className="start-btn" onClick={() => {
              const prefs = { vibes: tempVibes, blacklist: tempBlacklist };
              localStorage.setItem("vibe_prefs", JSON.stringify(prefs));
              localStorage.setItem("vibe_onboarded", "1");
              setAnswers(a => ({ ...a, preferredVibes: tempVibes, blacklistGenres: tempBlacklist }));
              setScreen("setup");
            }}>
              {(tempVibes.length + tempBlacklist.length) > 0 ? "완료 → 시작하기 🚀" : "그냥 넘어갈게 →"}
            </button>
          </div>
        );
      })()}

      {/* ── 설정 화면 ── */}
      {screen === "setup" && (
        <div className="screen fade-in">
          <div style={{ marginBottom:28, paddingTop:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px" }}>오늘 뭐하지? ✨</div>
              <button onClick={() => {
                localStorage.removeItem("vibe_onboarded");
                localStorage.removeItem("vibe_prefs");
                setTempVibes([]); setTempBlacklist([]);
                setScreen("onboarding");
              }} style={{
                padding:"6px 12px", borderRadius:100, border:"1.5px solid #E0DED8",
                background:"#fff", fontSize:11, fontWeight:700, color:"#aaa",
                cursor:"pointer", fontFamily:"inherit"
              }}>⚙ 취향 설정</button>
            </div>
            <div style={{ fontSize:14, color:"#999", marginTop:6 }}>지금 상태 알려주면 오늘 하루 짜줄게</div>
          </div>

          {QUESTIONS.map((q, qi) => {
            const prevQ = qi > 0 ? QUESTIONS[qi - 1] : null;
            const showSection = !prevQ || prevQ.section !== q.section;

            return (
              <div key={q.id}>
                {showSection && <div className="section-tag">{q.section}</div>}
                <div className="q-card">
                  <div className="q-label">{q.label}</div>

                  {q.type === "slider" ? (
                    <div className="slider-wrap">
                      <div className="hour-display">
                        {answers.hours >= 24
                          ? `${Math.floor(answers.hours/24)}박${answers.hours%24>0?answers.hours%24+"시간":""}`
                          : answers.hours < 1 ? `${answers.hours*60}분`
                          : `${answers.hours}시간`}
                      </div>
                      <input type="range" min={0.5} max={48} step={0.5} value={answers.hours}
                        onChange={e => setAnswers(a => ({ ...a, hours: Number(e.target.value) }))} />
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#bbb", marginTop:6 }}>
                        <span>30분</span><span>1박</span><span>2박</span>
                      </div>
                    </div>
                  ) : (
                    <div className="opt-row">
                      {q.options.map(opt => {
                        const isSelected = answers[q.id] === opt.value;
                        const expKey = `${q.id}_${opt.value}`;
                        const isExpanded = expanded[expKey];

                        return (
                          <div key={opt.value}>
                            <button
                              className={`opt-btn ${isSelected ? "selected" : ""}`}
                              onClick={() => selectOption(q.id, opt.value)}
                            >
                              <span className="opt-label">{opt.label}</span>
                            </button>

                            {opt.subs?.length > 0 && isSelected && (
                              <div className="sub-list fade-in">
                                {opt.subLabel && (
                                  <div style={{fontSize:12,color:"#aaa",padding:"8px 16px 4px",fontWeight:600,display:"flex",justifyContent:"space-between"}}>
                                    <span>{opt.subLabel}</span>
                                    {opt.maxSubs > 1 && <span style={{color:"#ccc"}}>최대 {opt.maxSubs}개</span>}
                                  </div>
                                )}
                                {getDynamicSubs(q.id, opt.value, opt.subs).map(sub => {
                                  const curSubs = answers.subs[q.id] || [];
                                  const checked = curSubs.includes(sub.value);
                                  return (
                                    <button key={sub.value} className="sub-item"
                                      onClick={() => selectSub(q.id, sub.value, opt.maxSubs || 1)}
                                      style={{ background: sub.isDynamic ? "rgba(255,200,50,0.07)" : "transparent" }}>
                                      <div className={`sub-check ${checked ? "checked" : ""}`}>
                                        {checked && <span style={{ color:"#fff", fontSize:11 }}>✓</span>}
                                      </div>
                                      <span className="sub-text">{sub.label}</span>
                                      {sub.isDynamic && <span style={{ fontSize:10, color:"#c8a000", fontWeight:700, marginLeft:4 }}>✦</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button className="start-btn" disabled={!canStart} onClick={() => startTournament(false)}>
            {canStart ? "취향 찾기 시작 →" : `아직 ${missing.length}개 남았어`}
          </button>
          {canStart && (
            <button onClick={() => {
              // 토너먼트 스킵: 점수 기반으로 바로 코스 생성
              const learnedVibes = getLearnedVibes();
              const enrichedAnswers = {
                ...answers,
                preferredVibes: [...new Set([...(answers.preferredVibes || []), ...learnedVibes])]
              };
              let m = matchActivities(enrichedAnswers);
              m = m.map(act => ({ ...act, score: (act.score || 0) + getTimeBonus(act) }))
                   .sort((a, b) => b.score - a.score);
              const topAct = m[0];
              if (!topAct) return;
              setChampion(topAct);
              setMatched(m);
              try {
                const coursePrefs = {
                  need: answers.need, alone: answers.alone,
                  location: answers.location, cost: answers.cost,
                  subs: answers.subs, hours: answers.hours,
                  preferredVibes: enrichedAnswers.preferredVibes,
                  blacklistGenres: answers.blacklistGenres,
                  timeSlot: getTimeSlot(),
                };
                const plans = buildCoursePlans(ACTIVITIES, coursePrefs, topAct.id);
                setCourses(plans);

                const _cpResult = extractChampion(plans, {
                  need: answers.need, subs: answers.subs, alone: answers.alone,
                });
                setChampionPick(_cpResult);
              } catch { setCourses([]); }
              setSelectedCourse(null);
              setScreen("result");
            }} style={{
              width:"100%", marginTop:10, padding:"15px",
              background:"#fff", border:"1.5px solid #E0DED8",
              borderRadius:16, fontSize:15, fontWeight:700,
              color:"#555", cursor:"pointer", fontFamily:"inherit"
            }}>
              🎲 그냥 골라줘
            </button>
          )}
          {canStart && (
            <button onClick={() => startTournament(true)} style={{
              width:"100%", marginTop:8, padding:"12px",
              background:"transparent", border:"none",
              fontSize:13, fontWeight:600,
              color:"#aaa", cursor:"pointer", fontFamily:"inherit"
            }}>
              ✦ 도전 모드 — 안 해본 것들로만
            </button>
          )}
        </div>
      )}

      {/* ── 토너먼트 화면 ── */}
      {screen === "tournament" && pair.length >= 2 && (
        <div className="tournament-screen fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${(currentMatch / totalMatches) * 100}%` }} />
          </div>
          <div className="match-label">둘 중에 더 끌리는 거 골라봐 · {currentMatch}/{totalMatches}</div>

          <div className="cards-wrap">
            <div
              className={`toss-card ${picking === "left" ? "picking-left" : ""}`}
              onClick={() => pickWinner(pair[0], "left")}
            >
              <div className="card-emoji">{pair[0].emoji}</div>
              <div className="card-name">{pair[0].name}</div>
              <div className="card-time">{pair[0].time}분</div>
            </div>

            <div className="vs-divider">VS</div>

            <div
              className={`toss-card ${picking === "right" ? "picking-right" : ""}`}
              onClick={() => pickWinner(pair[1], "right")}
            >
              <div className="card-emoji">{pair[1].emoji}</div>
              <div className="card-name">{pair[1].name}</div>
              <div className="card-time">{pair[1].time}분</div>
            </div>
          </div>

          <button style={{ background:"transparent", border:"none", color:"#bbb", fontSize:13, cursor:"pointer", marginTop:24, width:"100%", fontFamily:"inherit" }}
            onClick={() => setScreen("setup")}>← 다시 설정</button>
        </div>
      )}

      {/* ── 결과 화면 ── */}
      {screen === "result" && champion && (
        <div className="result-screen fade-in">

          {/* 패턴 학습 배지 */}
          {(() => {
            const learnedVibes = getLearnedVibes();
            const VIBE_LABEL = {
              고요함:"조용하고 고요한 것", 두근거림:"두근거리는 것", 땀흘리기:"땀 흘리는 것",
              감성충전:"감성 충전", 완성하는기쁨:"완성의 기쁨", 자연감성:"자연 속 활동",
              소소한사치:"소소한 사치", 지적자극:"머리 쓰는 활동", 혼자만의시간:"혼자만의 시간",
              새로운경험:"새로운 경험", 야간감성:"밤 감성", 도전:"도전적인 활동", 자유로움:"자유로운 활동",
            };
            return learnedVibes.length >= 2 ? (
              <div style={{
                background:"#F5F3EE", borderRadius:14, padding:"10px 14px",
                marginBottom:12, fontSize:12, color:"#666", lineHeight:1.6
              }}>
                📊 <b>너의 취향 패턴</b> — {learnedVibes.slice(0,3).map(v => VIBE_LABEL[v] || v).join(", ")} 을 자주 선택했어
              </div>
            ) : null;
          })()}

          {/* ── 코스 선택 모드 ── */}
          {!selectedCourse && courses.length > 0 && (
            <div style={{ marginBottom:20 }}>

              {/* ── 오늘의 픽 카드 ── */}
              {championPick && (
                <div style={{
                  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  borderRadius: 20, padding: "20px 18px", marginBottom: 20, color: "#fff",
                  animation: "fadeIn 0.4s ease-out",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginBottom: 12 }}>
                    ✦ 오늘의 픽
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 44 }}>{championPick.activity.emoji}</div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>{championPick.activity.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                        {championPick.activity.duration || championPick.activity.time}분
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.95)",
                    lineHeight: 1.5, marginBottom: 10,
                    borderLeft: "3px solid rgba(255,255,255,0.4)", paddingLeft: 12,
                  }}>
                    "{championPick.hook}"
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 14 }}>
                    {championPick.reason}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 12px", background: "rgba(255,255,255,0.08)",
                    borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.5)",
                  }}>
                    <span>↓</span>
                    <span>이걸 포함한 코스가 아래 BEST MATCH야</span>
                  </div>
                </div>
              )}

              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.5px" }}>오늘 이렇게 보내볼까?</div>
                <div style={{ fontSize:13, color:"#999", marginTop:6 }}>
                  {champion.emoji} {champion.name} 취향 기반으로 코스 {courses.length}개 짜봤어
                </div>
              </div>

              {courses.map((course, i) => (
                <div key={i} onClick={() => {
                  setSelectedCourse(course);
                  setMySchedule(course.activities);
                  setFeedbackOpen(false); setFeedbackSent(false);
                }} style={{
                  background: i === 0 ? "#191919" : "#fff",
                  color: i === 0 ? "#fff" : "#191919",
                  borderRadius:20, padding:"20px 18px", marginBottom:12,
                  cursor:"pointer", transition:"all 0.2s",
                  boxShadow: i === 0 ? "0 4px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
                  border: i === 0 ? "none" : "1.5px solid #ECEAE4"
                }}>
                  {i === 0 && (
                    <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:8, letterSpacing:1 }}>
                      BEST MATCH
                    </div>
                  )}
                  <div style={{ fontSize:16, fontWeight:800, marginBottom:10 }}>{course.title}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                    {course.activities.map((act, j) => (
                      <div key={act.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ fontSize:20 }}>{act.emoji}</span>
                        <span style={{ fontSize:13, fontWeight:600 }}>{act.name}</span>
                        {j < course.activities.length - 1 && (
                          <span style={{ color: i === 0 ? "rgba(255,255,255,0.3)" : "#ddd", margin:"0 2px" }}>→</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:12, color: i === 0 ? "rgba(255,255,255,0.6)" : "#aaa", lineHeight:1.5 }}>
                      {course.reason}
                    </div>
                    <div style={{
                      fontSize:11, fontWeight:700, flexShrink:0, marginLeft:12,
                      padding:"4px 10px", borderRadius:100,
                      background: i === 0 ? "rgba(255,255,255,0.15)" : "#F0EDE8",
                      color: i === 0 ? "rgba(255,255,255,0.8)" : "#888"
                    }}>
                      {course.totalMinutes}분
                    </div>
                  </div>
                </div>
              ))}

              {/* 직접 만들기 — 추후 활성화
              <button type="button" onClick={() => {
                setSelectedCourse({ activities: [champion], title: "직접 만든 코스", reason: "", totalMinutes: champion.time });
                setMySchedule([champion]);
              }} style={{
                width:"100%", padding:"13px", background:"transparent",
                border:"1.5px dashed #C8C4BC", borderRadius:14,
                fontSize:13, fontWeight:700, color:"#aaa", cursor:"pointer",
                fontFamily:"inherit"
              }}>
                직접 일정 만들기 →
              </button> */}
            </div>
          )}

          {/* 코스 없을 때 fallback (기존 챔피언 카드) */}
          {!selectedCourse && courses.length === 0 && (
            <div style={{ perspective:"800px", marginBottom:12, height:200 }} onClick={() => setChampFlipped(f => !f)}>
              <div style={{
                width:"100%", height:"100%", position:"relative",
                transformStyle:"preserve-3d",
                transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",
                transform: champFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                cursor:"pointer"
              }}>
                <div style={{
                  position:"absolute", width:"100%", height:"100%",
                  backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                  background:"#191919", borderRadius:28, padding:"28px 24px",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8
                }}>
                  <div style={{fontSize:52}}>{champion.emoji}</div>
                  <div style={{fontSize:22, fontWeight:900, color:"#fff"}}>{champion.name}</div>
                  <span className="champ-badge">{champion.time}분</span>
                </div>
                <div style={{
                  position:"absolute", width:"100%", height:"100%",
                  backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                  transform:"rotateY(180deg)",
                  background:"#191919", color:"#fff", borderRadius:28, padding:"28px 24px",
                  display:"flex", flexDirection:"column", justifyContent:"center", gap:14
                }}>
                  <div style={{fontSize:28}}>{champion.emoji}</div>
                  <div style={{fontSize:15, fontWeight:700, lineHeight:1.6}}>{champion.hint}</div>
                  <div style={{fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6}}>💡 {champion.tip}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── 코스 선택 후: 일정 상세 ── */}
          {selectedCourse && (
            <div style={{ marginBottom:20 }}>
              {/* 제목 (탭하면 코스 목록으로 돌아감) */}
              <div style={{ marginBottom:16, cursor:"pointer" }} onClick={() => { setSelectedCourse(null); setMySchedule([]); }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:14, color:"#aaa" }}>←</span>
                  <div style={{ fontSize:20, fontWeight:900, letterSpacing:"-0.5px" }}>{selectedCourse.title}</div>
                </div>
                <div style={{ fontSize:13, color:"#999", marginTop:4 }}>{selectedCourse.reason}</div>
              </div>

              {/* 코스 흐름도 */}
              {mySchedule.map((act, i) => (
                <div key={act.id} style={{ marginBottom: i < mySchedule.length - 1 ? 0 : 12 }}>
                  <div className="schedule-item" style={{ position:"relative" }}>
                    <div style={{
                      width:28, height:28, borderRadius:"50%",
                      background: i === 0 ? "#191919" : "#F0EDE8",
                      color: i === 0 ? "#fff" : "#666",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontWeight:800, fontSize:12, flexShrink:0
                    }}>{i + 1}</div>
                    <div className="s-emoji">{act.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div className="s-name" style={{ marginBottom:2 }}>{act.name}</div>
                      <div style={{ fontSize:11, color:"#bbb" }}>{act.hint}</div>
                    </div>
                    <div className="s-time">{act.duration || act.time}분</div>
                  </div>
                  {i < mySchedule.length - 1 && (
                    <div style={{ display:"flex", justifyContent:"center", padding:"4px 0" }}>
                      <div style={{ width:1, height:20, background:"#E0DED8" }} />
                    </div>
                  )}
                </div>
              ))}

              {/* 총 시간 */}
              <div style={{
                textAlign:"center", padding:"12px", fontSize:13, color:"#aaa",
                background:"#F5F3EE", borderRadius:12
              }}>
                총 {mySchedule.reduce((s, a) => s + (a.duration || a.time), 0)}분 코스
              </div>

              {/* 피드백 버튼 */}
              {!feedbackOpen && !feedbackSent && (
                <button onClick={() => setFeedbackOpen(true)} style={{
                  width:"100%", marginTop:10, padding:"10px", background:"none",
                  border:"1px dashed #ddd", borderRadius:10, fontSize:13,
                  color:"#bbb", cursor:"pointer", fontFamily:"inherit"
                }}>
                  👎 이 코스 별로야
                </button>
              )}
              {feedbackOpen && !feedbackSent && (
                <div style={{ marginTop:10, background:"#FAFAF8", borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#666", marginBottom:10 }}>어디가 별로야?</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {FEEDBACK_REASONS.map(r => (
                      <button key={r.id} onClick={() => sendFeedback(r.id)} style={{
                        padding:"8px 14px", borderRadius:20, border:"1px solid #E0DED8",
                        background:"#fff", fontSize:13, cursor:"pointer", fontFamily:"inherit"
                      }}>
                        {r.emoji} {r.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setFeedbackOpen(false)} style={{
                    marginTop:8, background:"none", border:"none", fontSize:12,
                    color:"#bbb", cursor:"pointer", fontFamily:"inherit"
                  }}>취소</button>
                </div>
              )}
              {feedbackSent && (
                <div style={{
                  marginTop:10, textAlign:"center", padding:"12px",
                  background:"#F0FFF0", borderRadius:10, fontSize:13, color:"#4a4"
                }}>
                  피드백 저장됨! 다음에 개선할게요
                </div>
              )}
            </div>
          )}

          {/* 하단 버튼 */}
          <div style={{
            padding:"12px 0 24px", marginTop:8
          }}>
            {/* 코스 선택 중이면 "다른 코스 보기" 버튼 표시 */}
            {selectedCourse && courses.length > 0 && (
              <button type="button" onClick={() => { setSelectedCourse(null); setMySchedule([]); }} style={{
                width:"100%", padding:"14px", background:"#fff",
                border:"1.5px solid #E0DED8", borderRadius:14,
                fontSize:14, fontWeight:700, cursor:"pointer",
                fontFamily:"inherit", color:"#666", marginBottom:8
              }}>
                ← 다른 코스 보기
              </button>
            )}
            <button type="button" className="start-btn" style={{ marginTop:0 }} onClick={() => {
              setScreen("setup");
              // 답변 유지 (바꾸고 싶은 것만 설정 화면에서 탭)
              setMySchedule([]);
              setSuggestions([]);
              setCourses([]);
              setSelectedCourse(null);
              setTournamentHistory([]);
              setChampFlipped(false);
            }}>다시 해보기</button>
            <button type="button" onClick={() => { clearHistory(); alert("히스토리 초기화됐어. 다음부터 모든 활동이 다시 나와!"); }} style={{
              width:"100%", marginTop:8, padding:"10px",
              background:"transparent", border:"none",
              fontSize:12, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
            }}>↺ 히스토리 초기화 (처음부터 다시)</button>
          </div>
        </div>
      )}

      </>)}

      {/* ── 뭐 먹지 탭 ── */}
      {tab === "whatToEat" && (
        <div className="screen fade-in" style={{ paddingTop:32 }}>

          {/* 홈 */}
          {foodScreen === "home" && (<>
            <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px", marginBottom:8 }}>뭐 먹지? 🍽️</div>
            <div style={{ fontSize:14, color:"#999", marginBottom:32 }}>기분에 맞는 음식을 추천해줄게</div>

            <button onClick={() => { setFoodStep(0); setFoodAnswers({}); setFoodResult(null); setFoodScreen("questions"); }} style={{
              width:"100%", padding:"20px", background:"#191919", color:"#fff",
              border:"none", borderRadius:16, fontSize:16, fontWeight:800,
              cursor:"pointer", fontFamily:"inherit", marginBottom:12
            }}>
              🍴 나한테 맞는 음식 추천
            </button>

            <button onClick={() => { setRouletteCat("all"); setRouletteFood(null); setSpinDisplay(null); setFoodScreen("roulette"); }} style={{
              width:"100%", padding:"20px", background:"#fff", color:"#191919",
              border:"1.5px solid #E0DED8", borderRadius:16, fontSize:16, fontWeight:800,
              cursor:"pointer", fontFamily:"inherit"
            }}>
              🎲 랜덤으로 골라줘
            </button>
          </>)}

          {/* 질문 */}
          {foodScreen === "questions" && (<>
            <div style={{ fontSize:13, color:"#aaa", marginBottom:8 }}>{foodStep + 1} / {FOOD_QUESTIONS.length}</div>
            <div style={{ fontSize:22, fontWeight:900, marginBottom:20 }}>{FOOD_QUESTIONS[foodStep].label}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {FOOD_QUESTIONS[foodStep].options.map(opt => (
                <button key={opt.value} onClick={() => {
                  const next = { ...foodAnswers, [FOOD_QUESTIONS[foodStep].id]: opt.value };
                  setFoodAnswers(next);
                  if (foodStep < FOOD_QUESTIONS.length - 1) {
                    setFoodStep(foodStep + 1);
                  } else {
                    const prefs = { ...next, timeSlot: getFoodTimeSlot() };
                    const result = recommendFood(foods, prefs);
                    setFoodResult(result);
                    setFoodScreen("result");
                  }
                }} style={{
                  padding:"16px 18px", background: foodAnswers[FOOD_QUESTIONS[foodStep].id] === opt.value ? "#191919" : "#fff",
                  color: foodAnswers[FOOD_QUESTIONS[foodStep].id] === opt.value ? "#fff" : "#191919",
                  border:"1.5px solid #ECEAE4", borderRadius:14, fontSize:15, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left"
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => { if (foodStep > 0) setFoodStep(foodStep - 1); else setFoodScreen("home"); }} style={{
              marginTop:20, background:"transparent", border:"none",
              fontSize:13, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
            }}>
              ← 뒤로
            </button>
          </>)}

          {/* 결과 */}
          {foodScreen === "result" && foodResult?.main && (<>
            <div style={{ fontSize:13, color:"#aaa", marginBottom:4 }}>추천 결과 <span style={{ color:"#ccc" }}>· 카드를 탭하면 상식이 나와</span></div>
            {foodResult.reason && <div style={{ fontSize:13, color:"#666", marginBottom:10, lineHeight:1.5 }}>{foodResult.reason}</div>}

            {/* 메인 추천 카드 (뒤집기) */}
            <div style={{ perspective:"800px", marginBottom:16, cursor:"pointer" }} onClick={() => toggleFoodFlip(foodResult.main.id)}>
              <div style={{
                transformStyle:"preserve-3d", transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",
                transform: flippedFoods.has(foodResult.main.id) ? "rotateY(180deg)" : "rotateY(0deg)",
                position:"relative", minHeight:200
              }}>
                {/* 앞면 */}
                <div style={{
                  position:"absolute", width:"100%", backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                  background:"#191919", borderRadius:24, padding:"28px 24px",
                  textAlign:"center", color:"#fff"
                }}>
                  <div style={{ fontSize:56, marginBottom:12 }}>{foodResult.main.emoji}</div>
                  <div style={{ fontSize:24, fontWeight:900, marginBottom:8 }}>{foodResult.main.name}</div>
                  <div style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{foodResult.main.summary}</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16, flexWrap:"wrap" }}>
                    {foodResult.main.tags?.map(tag => (
                      <span key={tag} style={{
                        padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:600,
                        background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.7)"
                      }}>#{tag}</span>
                    ))}
                  </div>
                </div>
                {/* 뒷면 (상식) */}
                <div style={{
                  position:"absolute", width:"100%", backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                  transform:"rotateY(180deg)",
                  background:"#191919", borderRadius:24, padding:"28px 24px",
                  textAlign:"center", color:"#fff"
                }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>💡</div>
                  <div style={{ fontSize:18, fontWeight:900, marginBottom:12 }}>{foodResult.main.name} 상식</div>
                  <div style={{ fontSize:14, color:"rgba(255,255,255,0.85)", lineHeight:1.7 }}>{foodResult.main.trivia}</div>
                </div>
              </div>
            </div>

            {/* 대안 카드 (뒤집기) */}
            {foodResult.alternatives.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#999", marginBottom:10 }}>이것도 괜찮아</div>
                <div style={{ display:"flex", gap:10 }}>
                  {foodResult.alternatives.map(alt => (
                    <div key={alt.id} style={{ flex:1, perspective:"600px", cursor:"pointer" }} onClick={() => toggleFoodFlip(alt.id)}>
                      <div style={{
                        transformStyle:"preserve-3d", transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",
                        transform: flippedFoods.has(alt.id) ? "rotateY(180deg)" : "rotateY(0deg)",
                        position:"relative", minHeight:160
                      }}>
                        <div style={{
                          position:"absolute", width:"100%", backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                          background:"#fff", borderRadius:16, padding:"16px 12px",
                          textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                        }}>
                          <div style={{ fontSize:32, marginBottom:6 }}>{alt.emoji}</div>
                          <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{alt.name}</div>
                          <div style={{ fontSize:11, color:"#aaa", lineHeight:1.4 }}>{alt.summary}</div>
                        </div>
                        <div style={{
                          position:"absolute", width:"100%", backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                          transform:"rotateY(180deg)",
                          background:"#F5F3EE", borderRadius:16, padding:"16px 12px",
                          textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                        }}>
                          <div style={{ fontSize:20, marginBottom:6 }}>💡</div>
                          <div style={{ fontSize:12, fontWeight:700, marginBottom:6 }}>{alt.name}</div>
                          <div style={{ fontSize:11, color:"#666", lineHeight:1.5 }}>{alt.trivia}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setFoodStep(0); setFoodAnswers({}); setFoodResult(null); setFoodScreen("questions"); }} style={{
              width:"100%", padding:"15px", background:"#191919", color:"#fff",
              border:"none", borderRadius:14, fontSize:15, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", marginBottom:8
            }}>
              다시 추천 받기
            </button>
            <button onClick={() => setFoodScreen("home")} style={{
              width:"100%", padding:"12px", background:"transparent", border:"none",
              fontSize:13, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
            }}>
              ← 처음으로
            </button>
          </>)}

          {/* 룰렛 */}
          {foodScreen === "roulette" && (<>
            <div style={{ fontSize:22, fontWeight:900, marginBottom:16 }}>🎲 랜덤 음식 룰렛</div>

            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
              {FOOD_CATS.map(cat => (
                <button key={cat.key} onClick={() => { if (!spinning) { setRouletteCat(cat.key); setRouletteFood(null); setSpinDisplay(null); } }} style={{
                  padding:"8px 14px", borderRadius:100, fontSize:13, fontWeight:700,
                  border: rouletteCat === cat.key ? "1.5px solid #191919" : "1.5px solid #E0DED8",
                  background: rouletteCat === cat.key ? "#191919" : "#fff",
                  color: rouletteCat === cat.key ? "#fff" : "#666",
                  cursor: spinning ? "default" : "pointer", fontFamily:"inherit"
                }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            <div style={{
              background:"#fff", borderRadius:24, padding:"40px 24px",
              textAlign:"center", marginBottom:20, minHeight:200,
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"
            }}>
              {spinDisplay ? (<>
                <div style={{ fontSize:64, marginBottom:12, transition: spinning ? "none" : "transform 0.3s", transform: !spinning ? "scale(1.1)" : "scale(1)" }}>{spinDisplay.emoji}</div>
                <div style={{ fontSize:22, fontWeight:900, color: spinning ? "#ccc" : "#191919" }}>{spinDisplay.name}</div>
                {!spinning && rouletteFood && (<>
                  {/* 앞면/뒷면 토글 */}
                  {!flippedFoods.has(rouletteFood.id) ? (<>
                    <div style={{ fontSize:13, color:"#999", marginTop:8, lineHeight:1.5, padding:"0 12px" }}>{rouletteFood.summary}</div>
                    <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:12, flexWrap:"wrap", padding:"0 8px" }}>
                      {rouletteFood.tags?.map(tag => (
                        <span key={tag} style={{ padding:"3px 8px", borderRadius:100, fontSize:10, fontWeight:600, background:"#F0EDE8", color:"#888" }}>#{tag}</span>
                      ))}
                    </div>
                  </>) : (<>
                    <div style={{ fontSize:13, color:"#666", marginTop:12, lineHeight:1.7, padding:"0 12px" }}>💡 {rouletteFood.trivia}</div>
                  </>)}
                  <button onClick={(e) => { e.stopPropagation(); toggleFoodFlip(rouletteFood.id); }} style={{
                    marginTop:12, background:"#F0EDE8", border:"none", borderRadius:100,
                    padding:"4px 14px", fontSize:11, fontWeight:600, color:"#888", cursor:"pointer", fontFamily:"inherit"
                  }}>
                    {flippedFoods.has(rouletteFood.id) ? "설명 보기" : "💡 상식 보기"}
                  </button>
                </>)}
              </>) : (
                <div style={{ fontSize:18, color:"#ccc", fontWeight:600 }}>카테고리 고르고 돌려!</div>
              )}
            </div>

            {!rouletteFood ? (
              <button onClick={startRoulette} disabled={spinning} style={{
                width:"100%", padding:"17px", background: spinning ? "#D0CEC8" : "#191919",
                color: spinning ? "#999" : "#fff", border:"none", borderRadius:16,
                fontSize:16, fontWeight:800, cursor: spinning ? "default" : "pointer", fontFamily:"inherit"
              }}>
                {spinning ? "돌리는 중..." : "🎰 돌려!"}
              </button>
            ) : (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={startRoulette} style={{
                  flex:1, padding:"15px", background:"#191919", color:"#fff",
                  border:"none", borderRadius:14, fontSize:15, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit"
                }}>
                  🎰 다시 돌려
                </button>
                <button onClick={() => setFoodScreen("home")} style={{
                  flex:1, padding:"15px", background:"#fff", color:"#666",
                  border:"1.5px solid #E0DED8", borderRadius:14, fontSize:15, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit"
                }}>
                  처음으로
                </button>
              </div>
            )}

            <button onClick={() => setFoodScreen("home")} style={{
              marginTop:12, width:"100%", background:"transparent", border:"none",
              fontSize:13, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
            }}>
              ← 뒤로
            </button>
          </>)}

        </div>
      )}

      {/* ── 어디 가지 탭 ── */}
      {tab === "whereToGo" && (
        <div className="screen fade-in" style={{ paddingTop:32 }}>

          {/* 홈 화면 */}
          {placeScreen === "home" && (<>
            <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px", marginBottom:8 }}>어디 가지? 📍</div>
            <div style={{ fontSize:14, color:"#999", marginBottom:28 }}>지금 기분에 맞는 장소를 찾아줄게</div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {PLACE_MOODS.map(m => (
                <button key={m.id} onClick={() => recommendPlace(m.id)} style={{
                  background:"#fff", border:"none", borderRadius:16, padding:"20px 18px",
                  display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.06)", fontFamily:"inherit",
                  textAlign:"left", transition:"transform 0.15s"
                }} onPointerDown={e => e.currentTarget.style.transform="scale(0.97)"}
                   onPointerUp={e => e.currentTarget.style.transform="scale(1)"}
                   onPointerLeave={e => e.currentTarget.style.transform="scale(1)"}>
                  <div style={{ fontSize:28 }}>{m.emoji}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#2D2D2D" }}>{m.label}</div>
                </button>
              ))}
            </div>
          </>)}

          {/* 결과 화면 */}
          {placeScreen === "result" && placeResult && (<>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
              <button onClick={() => setPlaceScreen("home")} style={{
                background:"none", border:"none", fontSize:20, cursor:"pointer", padding:4
              }}>←</button>
              <div style={{ fontSize:20, fontWeight:800 }}>추천 장소</div>
            </div>

            {/* 메인 추천 */}
            <div style={{
              background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius:20, padding:"28px 22px", color:"#fff", marginBottom:16
            }}>
              <div style={{ fontSize:13, opacity:0.8, marginBottom:8 }}>오늘의 추천 — {placeResult.reason}</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{ fontSize:40 }}>{placeResult.main.emoji}</div>
                <div>
                  <div style={{ fontSize:22, fontWeight:800 }}>{placeResult.main.name}</div>
                  <div style={{ fontSize:13, opacity:0.85, marginTop:4, lineHeight:1.5 }}>{placeResult.main.summary}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                {placeResult.main.tags.map(tag => (
                  <span key={tag} style={{
                    background:"rgba(255,255,255,0.2)", borderRadius:20,
                    padding:"4px 10px", fontSize:11, color:"#fff"
                  }}>#{tag}</span>
                ))}
              </div>
            </div>

            {/* 대안 */}
            <div style={{ fontSize:14, fontWeight:700, color:"#999", marginBottom:10 }}>이런 곳도 있어요</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {placeResult.alternatives.map(p => (
                <div key={p.id} style={{
                  background:"#fff", borderRadius:14, padding:"14px 16px",
                  display:"flex", alignItems:"center", gap:12,
                  boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ fontSize:28 }}>{p.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:"#aaa", lineHeight:1.4 }}>{p.summary}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 다시 추천 + 처음으로 */}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => recommendPlace(placeResult.moodId || "random")} style={{
                flex:1, padding:"14px", borderRadius:12, border:"none",
                background:"#F5F3F0", fontSize:14, fontWeight:700,
                cursor:"pointer", fontFamily:"inherit", color:"#2D2D2D"
              }}>🔄 다시 추천</button>
              <button onClick={() => setPlaceScreen("home")} style={{
                flex:1, padding:"14px", borderRadius:12, border:"none",
                background:"#F5F3F0", fontSize:14, fontWeight:700,
                cursor:"pointer", fontFamily:"inherit", color:"#2D2D2D"
              }}>🏠 처음으로</button>
            </div>
          </>)}

        </div>
      )}

      {/* ── 하단 탭바 ── */}
      {screen !== "onboarding" && screen !== "tournament" && (
        <div style={{
          position:"fixed", bottom:0, left:0, right:0,
          background:"#fff", borderTop:"1px solid #E8E5E0",
          display:"flex", justifyContent:"center", zIndex:50,
          padding:"0 0 env(safe-area-inset-bottom)"
        }}>
          <div style={{ display:"flex", maxWidth:480, width:"100%", justifyContent:"space-around" }}>
            {[
              { key:"whatToDo", label:"뭐 할까", icon:"✨" },
              { key:"whatToEat", label:"뭐 먹지", icon:"🍽️" },
              { key:"whereToGo", label:"어디 가지", icon:"📍" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex:1, padding:"12px 0 10px", background:"transparent",
                border:"none", cursor:"pointer", fontFamily:"inherit",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                color: tab === t.key ? "#191919" : "#bbb",
                transition:"color 0.15s"
              }}>
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <span style={{ fontSize:11, fontWeight: tab === t.key ? 800 : 500 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
