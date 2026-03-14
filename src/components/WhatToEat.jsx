import React, { useState, useEffect, useRef } from "react";
import { foods } from '../data/foods.js';

// ─── 뭐 먹지 카드 월드컵 질문 ────────────────────────────────
const FOOD_WC_QUESTIONS = [
  {
    id: "exclude", label: "오늘은 이건 안 땡겨", multi: true,
    options: [
      { value: "ok", label: "✅ 다 괜찮아" },
      { value: "meat", label: "🍖 고기 말고" },
      { value: "seafood", label: "🐟 해산물 말고" },
      { value: "spicy", label: "🌶️ 매운 거 말고" },
      { value: "noodle", label: "🍜 면 말고" },
      { value: "dairy", label: "🥛 유제품 말고" },
      { value: "flour", label: "🍕 밀가루 말고" },
      { value: "vegonly", label: "🥗 채소 위주 말고" },
      { value: "alcohol", label: "🍺 술 포함 말고" },
    ],
  },
  {
    id: "withWho", label: "누구랑 먹어?", multi: false,
    options: [
      { value: "alone", label: "🙋 혼자" },
      { value: "two", label: "👫 둘이" },
      { value: "group", label: "👥 여럿이" },
      { value: "office", label: "🏢 회사 점심" },
    ],
  },
  {
    id: "category", label: "어떤 음식?", multi: false,
    options: [
      { value: "한식", label: "🇰🇷 한식" }, { value: "일식", label: "🇯🇵 일식" },
      { value: "양식", label: "🍝 양식" }, { value: "중식", label: "🥟 중식" },
      { value: "분식", label: "🌶️ 분식" }, { value: "고기", label: "🥩 고기" },
      { value: "면", label: "🍜 면" }, { value: "패스트푸드", label: "🍔 패스트푸드" },
      { value: "간편식", label: "🍱 도시락·간편식" }, { value: "간식", label: "☕ 카페·디저트" },
      { value: "동남아", label: "🌏 아시안" }, { value: "any", label: "🎲 상관없어" },
    ],
  },
  {
    id: "mood", label: "지금 상태는?", multi: false,
    options: [
      { value: "자극적", label: "🔥 자극적" }, { value: "든든", label: "🫕 든든하게" },
      { value: "가벼운", label: "🥗 가볍게" }, { value: "해장", label: "🍺 해장" },
      { value: "특별한", label: "✨ 특별하게" }, { value: "빠르게", label: "⚡ 빠르게" },
    ],
  },
];

const FOOD_CATS = [
  { key: "all", label: "전체", emoji: "🍽️" },
  { key: "한식", label: "한식", emoji: "🇰🇷" },
  { key: "일식", label: "일식", emoji: "🇯🇵" },
  { key: "양식", label: "양식", emoji: "🍝" },
  { key: "중식", label: "중식", emoji: "🥟" },
  { key: "분식", label: "분식", emoji: "🌶️" },
  { key: "고기", label: "고기", emoji: "🥩" },
  { key: "면", label: "면", emoji: "🍜" },
  { key: "패스트푸드", label: "패스트푸드", emoji: "🍔" },
  { key: "간편식", label: "간편식", emoji: "🍱" },
  { key: "간식", label: "카페·디저트", emoji: "☕" },
  { key: "동남아", label: "아시안", emoji: "🌏" },
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

// ─── 카테고리별 기본 후식 매핑 ────────────────────────────────
const DEFAULT_AFTER_FOOD = {
  "고기":    { emoji: "🍦", name: "소프트아이스크림", reason: "느끼함을 싹 잡아줘!" },
  "자극적":  { emoji: "🧋", name: "버블티", reason: "얼얼함을 달래줘!" },
  "면":      { emoji: "🍫", name: "초콜릿", reason: "단맛으로 마무리!" },
  "일식":    { emoji: "🍵", name: "녹차아이스크림", reason: "말차로 깔끔하게!" },
  "양식":    { emoji: "☕", name: "아메리카노", reason: "느끼함 정리 완료!" },
  "분식":    { emoji: "🧋", name: "달고나커피", reason: "달달하게 마무리!" },
  "한식":    { emoji: "🍵", name: "식혜", reason: "전통 있는 마무리!" },
  "국물":    { emoji: "🍵", name: "수정과", reason: "속이 편안해져!" },
  "중식":    { emoji: "🍵", name: "자스민차", reason: "향긋하게 정리!" },
  "패스트푸드": { emoji: "🥤", name: "콜라", reason: "패푸엔 콜라가 국룰!" },
  "간편식":  { emoji: "☕", name: "커피", reason: "간단한 마무리!" },
  "간식":    { emoji: "🥛", name: "우유", reason: "달콤한 마무리!" },
  "동남아":  { emoji: "🥥", name: "코코넛워터", reason: "열대 무드 완성!" },
};

function getAfterFood(food) {
  if (food.afterFood) return food.afterFood;
  // mood 기반
  if (food.mood?.includes("자극적")) return DEFAULT_AFTER_FOOD["자극적"];
  // 카테고리 기반
  for (const cat of (food.category || [])) {
    if (DEFAULT_AFTER_FOOD[cat]) return DEFAULT_AFTER_FOOD[cat];
  }
  return { emoji: "☕", name: "아메리카노", reason: "깔끔하게 마무리!" };
}

export default function WhatToEat({ sodaKeys, setSodaKeys, sodaColorRef, onHideTabBar, goToPlaceFromContext }) {
  // ── 음식 탭 상태 ──
  const [foodScreen, setFoodScreen] = useState("home"); // home | wcQuestions | wcRoundPick | wcTournament | wcResult | roulette
  const [foodStep, setFoodStep] = useState(0);
  const [foodAnswers, setFoodAnswers] = useState({});
  const [foodResult, setFoodResult] = useState(null);
  const [rouletteCat, setRouletteCat] = useState("all");
  const [rouletteFood, setRouletteFood] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState(null);
  const [flippedFoods, setFlippedFoods] = useState(new Set());
  const spinRef = useRef(null);
  // 음식 월드컵 상태
  const [foodBracket, setFoodBracket] = useState([]);
  const [foodMatchIdx, setFoodMatchIdx] = useState(0);
  const [foodRoundWinners, setFoodRoundWinners] = useState([]);
  const [foodChampion, setFoodChampion] = useState(null);
  const [foodPicking, setFoodPicking] = useState(null);
  const [foodTourneyHistory, setFoodTourneyHistory] = useState([]);
  const [showFoodRunnerUps, setShowFoodRunnerUps] = useState(false);
  // 후식 추천 애니메이션 상태
  const [afterDots, setAfterDots] = useState([false,false,false]);
  const [afterPhase, setAfterPhase] = useState("idle"); // idle | dots | show
  const [afterBurstKey, setAfterBurstKey] = useState(0);
  const afterTimers = useRef([]);

  // 탭바 숨김 처리
  useEffect(() => {
    if (foodScreen === "wcTournament") {
      onHideTabBar(true);
    } else {
      onHideTabBar(false);
    }
    return () => onHideTabBar(false);
  }, [foodScreen, onHideTabBar]);

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

  // ── 음식 월드컵 매칭 ──
  function matchFoods(fAnswers) {
    const excludes = fAnswers.exclude || [];
    const withWho = fAnswers.withWho;
    const category = fAnswers.category;
    const mood = fAnswers.mood;
    const ts = getFoodTimeSlot();

    return foods.map(f => {
      let score = 0;
      // 제외 필터
      if (!excludes.includes("ok") && excludes.length > 0) {
        if (excludes.includes("meat") && (f.category?.some(c => ["고기"].includes(c)) || f.tags?.some(t => ["고기","삼겹살","소고기","돼지고기"].includes(t)))) return null;
        if (excludes.includes("seafood") && (f.tags?.some(t => ["해산물","생선","새우","조개","회"].includes(t)) || f.name?.includes("회") || f.name?.includes("초밥"))) return null;
        if (excludes.includes("spicy") && f.mood?.includes("자극적")) return null;
        if (excludes.includes("noodle") && f.category?.includes("면")) return null;
        if (excludes.includes("dairy") && f.tags?.some(t => ["치즈","크리미","유제품"].includes(t))) return null;
        if (excludes.includes("flour") && (f.category?.includes("분식") || f.tags?.some(t => ["밀가루","빵","파스타"].includes(t)))) return null;
        if (excludes.includes("vegonly") && f.mood?.includes("건강한") && f.heaviness === "light") return null;
        if (excludes.includes("alcohol") && f.tags?.some(t => ["술","맥주안주","와인안주"].includes(t))) return null;
      }
      // withWho 필터
      if (withWho === "alone" && f.withWho && !f.withWho.includes("alone")) return null;
      if (withWho === "office" && f.duration > 40) return null;

      // 카테고리 필터
      if (category && category !== "any") {
        if (!f.category?.includes(category)) score -= 10;
      }
      // mood 점수
      if (mood && f.mood?.includes(mood)) score += 4;
      // timeSlot
      if (f.timeSlots?.includes(ts)) score += 3;
      // 특수 규칙: 회사 점심
      if (withWho === "office") {
        if (f.category?.some(c => ["간편식","한식"].includes(c)) || f.tags?.some(t => ["빠름","혼밥","가성비"].includes(t))) score += 5;
      }
      // 빠르게
      if (mood === "빠르게") {
        if (f.duration <= 25 || f.category?.some(c => ["간편식","패스트푸드"].includes(c))) score += 5;
      }
      // 랜덤성
      score += Math.random() * 1;
      return { ...f, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }

  function startFoodWorldCup(bracketSize = 16) {
    const matched = matchFoods(foodAnswers);
    const topN = Math.min(bracketSize + 8, matched.length);
    const pool = [...matched.slice(0, topN)].sort(() => Math.random() - 0.5).slice(0, bracketSize);
    setFoodBracket(pool);
    setFoodMatchIdx(0);
    setFoodRoundWinners([]);
    setFoodChampion(null);
    setFoodPicking(null);
    setFoodTourneyHistory([]);
    setShowFoodRunnerUps(false);
    setFoodScreen("wcTournament");
  }

  function pickFoodWinner(winner, side) {
    if (foodPicking) return;
    setFoodPicking(side);
    // 소다 색상
    const FC = [
      ["#fff7ed","#f97316"],["#f0fdf4","#22d3a5"],["#fefce8","#facc15"],
      ["#eff6ff","#6366f1"],["#f5f3ff","#a78bfa"],["#ecfdf5","#34d399"],
    ];
    sodaColorRef.current._foodTourney = FC[Math.floor(Math.random() * FC.length)];
    setSodaKeys(p => ({ ...p, _foodTourney: (p._foodTourney || 0) + 1 }));
    setFoodTourneyHistory(h => [...h, winner]);
    setTimeout(() => {
      const newW = [...foodRoundWinners, winner];
      const nextIdx = foodMatchIdx + 2;
      if (nextIdx >= foodBracket.length) {
        if (newW.length === 1) {
          setFoodChampion(newW[0]);
          setFoodPicking(null);
          setFoodScreen("wcResult");
          // food_history에 저장
          try {
            const fh = JSON.parse(localStorage.getItem("food_history") || "[]");
            const today = new Date().toLocaleDateString("ko-KR", { month:"short", day:"numeric" });
            fh.push({ id: newW[0].id, name: newW[0].name, emoji: newW[0].emoji, date: today });
            if (fh.length > 20) fh.splice(0, fh.length - 20);
            localStorage.setItem("food_history", JSON.stringify(fh));
          } catch {};
          // 후식 애니메이션 트리거
          setAfterPhase("idle");
          setAfterDots([false,false,false]);
          afterTimers.current.forEach(clearTimeout);
          afterTimers.current = [];
          const t1 = setTimeout(() => { setAfterPhase("dots"); setAfterDots([true,false,false]); }, 1500);
          const t2 = setTimeout(() => setAfterDots([true,true,false]), 2000);
          const t3 = setTimeout(() => setAfterDots([true,true,true]), 2500);
          const t4 = setTimeout(() => { setAfterBurstKey(k => k+1); setAfterPhase("show"); }, 3100);
          afterTimers.current = [t1,t2,t3,t4];
        } else {
          setFoodPicking(null);
          setFoodBracket(newW);
          setFoodMatchIdx(0);
          setFoodRoundWinners([]);
        }
      } else {
        setFoodPicking(null);
        setFoodMatchIdx(nextIdx);
        setFoodRoundWinners(newW);
      }
    }, 900);
  }

  return (
    <div className={foodScreen === "wcTournament" ? "tournament-screen fade-in" : "screen fade-in"} style={foodScreen === "wcTournament" ? {} : { paddingTop:32 }}>

      {/* 홈 */}
      {foodScreen === "home" && (<>
        <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px", marginBottom:8 }}>뭐 먹지? 🍽️</div>
        <div style={{ fontSize:14, color:"#999", marginBottom:20 }}>오늘 뭐 먹을지 같이 골라보자</div>

        {/* 음식 캐러셀 */}
        <div style={{ overflow:"hidden", marginBottom:24, marginLeft:-20, marginRight:-20 }}>
          <div style={{
            display:"flex", gap:10, paddingLeft:20, paddingRight:20,
            animation:"foodScroll 20s linear infinite",
            width:"max-content",
          }}>
            {(() => {
              const shuffled = [...foods].sort(() => Math.random() - 0.5).slice(0, 15);
              const doubled = [...shuffled, ...shuffled];
              return doubled.map((f, i) => (
                <div key={`${f.id}-${i}`} style={{
                  flexShrink:0, background:"#fff", borderRadius:14,
                  padding:"10px 14px", display:"flex", alignItems:"center", gap:8,
                  boxShadow:"0 1px 3px rgba(0,0,0,0.05)", minWidth:110,
                }}>
                  <span style={{ fontSize:22 }}>{f.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:"#2D2D2D", whiteSpace:"nowrap" }}>{f.name}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <button onClick={() => { setFoodStep(0); setFoodAnswers({}); setFoodChampion(null); setFoodScreen("wcQuestions"); }} style={{
          width:"100%", padding:"20px", background:"#191919", color:"#fff",
          border:"none", borderRadius:16, fontSize:16, fontWeight:800,
          cursor:"pointer", fontFamily:"inherit", marginBottom:12
        }}>
          🥊 내 취향 음식 찾기
        </button>

        <button onClick={() => { setRouletteCat("all"); setRouletteFood(null); setSpinDisplay(null); setFoodScreen("roulette"); }} style={{
          width:"100%", padding:"20px", background:"#fff", color:"#191919",
          border:"1.5px solid #E0DED8", borderRadius:16, fontSize:16, fontWeight:800,
          cursor:"pointer", fontFamily:"inherit"
        }}>
          🎲 랜덤 룰렛
        </button>

        {/* 최근에 먹은 것 */}
        {(() => {
          const history = JSON.parse(localStorage.getItem("food_history") || "[]");
          if (history.length === 0) return null;
          const recent = history.slice(-5).reverse();
          return (
            <div style={{ marginTop:24 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#aaa", marginBottom:10 }}>최근에 먹은 것</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {recent.map((item, i) => {
                  const food = foods.find(f => f.id === item.id || f.name === item.name);
                  return (
                    <div key={i} style={{
                      background:"#fff", borderRadius:12, padding:"10px 14px",
                      display:"flex", alignItems:"center", gap:10,
                      boxShadow:"0 1px 3px rgba(0,0,0,0.04)"
                    }}>
                      <span style={{ fontSize:22 }}>{food?.emoji || item.emoji || "🍽️"}</span>
                      <span style={{ fontSize:14, fontWeight:600, color:"#2D2D2D" }}>{food?.name || item.name}</span>
                      {item.date && <span style={{ fontSize:11, color:"#ccc", marginLeft:"auto" }}>{item.date}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </>)}

      {/* 카드 월드컵 질문 */}
      {foodScreen === "wcQuestions" && (() => {
        const q = FOOD_WC_QUESTIONS[foodStep];
        const isExclude = q.id === "exclude";
        const curExcludes = foodAnswers.exclude || [];
        return (<>
          <div style={{ fontSize:13, color:"#aaa", marginBottom:8 }}>{foodStep + 1} / {FOOD_WC_QUESTIONS.length}</div>
          <div style={{ fontSize:22, fontWeight:900, marginBottom:20 }}>{q.label}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {q.options.map(opt => {
              const isSelected = isExclude
                ? curExcludes.includes(opt.value)
                : foodAnswers[q.id] === opt.value;
              return (
                <button key={opt.value} onClick={() => {
                  if (isExclude) {
                    if (opt.value === "ok") {
                      // "다 괜찮아" → 스킵
                      setFoodAnswers(a => ({ ...a, exclude: ["ok"] }));
                      setFoodStep(1);
                      return;
                    }
                    setFoodAnswers(a => {
                      const prev = (a.exclude || []).filter(v => v !== "ok");
                      const next = prev.includes(opt.value)
                        ? prev.filter(v => v !== opt.value)
                        : [...prev, opt.value];
                      return { ...a, exclude: next };
                    });
                  } else {
                    const next = { ...foodAnswers, [q.id]: opt.value };
                    // 회사 점심 → 빠르게 자동
                    if (q.id === "withWho" && opt.value === "office") {
                      next.mood = "빠르게";
                    }
                    setFoodAnswers(next);
                    if (foodStep < FOOD_WC_QUESTIONS.length - 1) {
                      setFoodStep(foodStep + 1);
                    } else {
                      setFoodAnswers(next);
                      setFoodScreen("wcRoundPick");
                    }
                  }
                }} style={{
                  padding:"14px 18px",
                  background: isSelected ? "#191919" : "#fff",
                  color: isSelected ? "#fff" : "#191919",
                  border:"1.5px solid #ECEAE4", borderRadius:14, fontSize:15, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left"
                }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
          {isExclude && curExcludes.length > 0 && !curExcludes.includes("ok") && (
            <button onClick={() => setFoodStep(1)} style={{
              width:"100%", marginTop:16, padding:"15px",
              background:"#191919", color:"#fff", border:"none", borderRadius:14,
              fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit"
            }}>
              다음 →
            </button>
          )}
          <button onClick={() => { if (foodStep > 0) setFoodStep(foodStep - 1); else setFoodScreen("home"); }} style={{
            marginTop:16, background:"transparent", border:"none",
            fontSize:13, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
          }}>
            ← 뒤로
          </button>
        </>);
      })()}

      {/* 라운드 선택 */}
      {foodScreen === "wcRoundPick" && (
        <div className="screen fade-in" style={{ paddingTop:60, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🍽️</div>
          <div style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>취향 음식 찾기</div>
          <div style={{ fontSize:14, color:"#999", marginBottom:32 }}>어느 정도로 골라볼까?</div>
          <div style={{ display:"flex", gap:10, marginBottom:20 }}>
            {[
              { size:4, label:"빠르게", sub:"2번이면 끝", emoji:"🚀" },
              { size:8, label:"적당히", sub:"7번 고르기", emoji:"⚡" },
              { size:16, label:"제대로", sub:"15번 풀코스", emoji:"🏆" },
            ].map(r => (
              <button key={r.size} onClick={() => startFoodWorldCup(r.size)} style={{
                flex:1, padding:"18px 8px", borderRadius:16,
                border:"1.5px solid #E0DED8", background:"#fff",
                cursor:"pointer", fontFamily:"inherit",
                display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <span style={{ fontSize:28 }}>{r.emoji}</span>
                <span style={{ fontSize:15, fontWeight:700, color:"#191919" }}>{r.label}</span>
                <span style={{ fontSize:11, color:"#aaa" }}>{r.sub}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setFoodScreen("wcQuestions")} style={{
            background:"transparent", border:"none", fontSize:13,
            color:"#bbb", cursor:"pointer", fontFamily:"inherit"
          }}>← 뒤로</button>
        </div>
      )}

      {/* 카드 월드컵 토너먼트 */}
      {foodScreen === "wcTournament" && (() => {
        const fPair = foodBracket.slice(foodMatchIdx, foodMatchIdx + 2);
        const fTotal = foodBracket.length / 2;
        const fCurrent = Math.floor(foodMatchIdx / 2) + 1;
        const getFoodRoundLabel = () => {
          if (foodBracket.length === 16) return `16강 · ${fCurrent}/${fTotal}`;
          if (foodBracket.length === 8) return `8강 · ${fCurrent}/${fTotal}`;
          if (foodBracket.length === 4) return `4강 · ${fCurrent}/${fTotal}`;
          if (foodBracket.length === 2) return "🏆 결승!";
          return `${fCurrent}/${fTotal}`;
        };
        if (fPair.length < 2) return null;
        const ftc = sodaColorRef.current._foodTourney || ["#eff6ff","#6366f1"];
        const ftk = sodaKeys._foodTourney || 0;
        return (<>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${(fCurrent / fTotal) * 100}%` }} />
          </div>
          <div className="match-label">{getFoodRoundLabel()}</div>
          <div className="cards-wrap">
            {[["left", fPair[0]], ["right", fPair[1]]].map(([side, food], idx) => {
              if (!food) return null;
              const isPicked = foodPicking === side;
              const isOther = foodPicking && foodPicking !== side;
              const TB = [
                {left:"10%",size:5,dur:3.0,delay:0.2},{left:"22%",size:8,dur:2.6,delay:0.7},
                {left:"35%",size:4,dur:3.4,delay:1.3},{left:"48%",size:9,dur:2.8,delay:0.5},
                {left:"62%",size:6,dur:3.2,delay:1.0},{left:"75%",size:4,dur:2.9,delay:1.6},
                {left:"85%",size:7,dur:3.1,delay:0.4},{left:"50%",size:5,dur:2.7,delay:1.8},
              ];
              return (
                <React.Fragment key={side}>
                  {idx === 1 && <div className="vs-divider">VS</div>}
                  <div className={`toss-card${isPicked ? " picking-"+side : ""}`}
                    onClick={() => pickFoodWinner(food, side)}
                    style={{
                      opacity: isOther ? 0.4 : 1,
                      transition:"opacity 0.3s ease, transform 0.25s",
                      overflow:"hidden", position:"relative",
                      animation: isPicked ? "shakeCan 0.55s ease" : "none",
                    }}
                  >
                    {isPicked && (<>
                      <div className="liquid" key={ftk} style={{ position:"absolute", left:-4, right:-4, bottom:-50, top:-30, animation:"liquidRise 1.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards", zIndex:1 }}>
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:24, overflow:"hidden" }}>
                          <svg style={{ width:"200%", height:24, display:"block", animation:"waveScroll 2s linear infinite" }} viewBox="0 0 200 24" preserveAspectRatio="none">
                            <path d="M0,12 C25,2 50,22 75,12 C100,2 125,22 150,12 C175,2 200,22 200,12 L200,24 L0,24 Z" fill={ftc[0]} />
                          </svg>
                        </div>
                        <div style={{ position:"absolute", inset:0, top:18, background:`linear-gradient(180deg, ${ftc[0]} 0%, ${ftc[1]} 100%)` }} />
                      </div>
                      {TB.map((b, i) => (
                        <div key={`ft${ftk}-b${i}`} style={{
                          position:"absolute", width:b.size, height:b.size, left:b.left,
                          bottom:`${6+(i%6)*4}%`, borderRadius:"50%",
                          background:"rgba(255,255,255,0.78)", zIndex:3,
                          animation:`bubbleFloat ${b.dur}s ease-out ${b.delay}s infinite`,
                          opacity:0, "--drift":`${((i%5)-2)*5}px`, pointerEvents:"none",
                        }} />
                      ))}
                    </>)}
                    <div className="card-emoji" style={{ position:"relative", zIndex:4 }}>{food.emoji}</div>
                    <div className="card-name" style={{ position:"relative", zIndex:4 }}>{food.name}</div>
                    <div className="card-time" style={{ position:"relative", zIndex:4 }}>{food.duration}분</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <button style={{ background:"transparent", border:"none", color:"#bbb", fontSize:13, cursor:"pointer", marginTop:24, width:"100%", fontFamily:"inherit" }}
            onClick={() => setFoodScreen("home")}>← 그만하기</button>
        </>);
      })()}

      {/* 카드 월드컵 결과 */}
      {foodScreen === "wcResult" && foodChampion && (<>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:1.5, marginBottom:12 }}>🏆 오늘의 음식</div>

          {/* 메인 카드 */}
          <div style={{
            background:"#191919", borderRadius:24, padding:"32px 24px", textAlign:"center", color:"#fff",
            cursor:"pointer", animation:"fadeIn 0.4s ease-out",
          }} onClick={() => toggleFoodFlip(foodChampion.id)}>
            {!flippedFoods.has(foodChampion.id) ? (<>
              <div style={{ fontSize:64, marginBottom:12 }}>{foodChampion.emoji}</div>
              <div style={{ fontSize:26, fontWeight:900, marginBottom:8 }}>{foodChampion.name}</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.5, marginBottom:12 }}>{foodChampion.summary}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>탭하면 상식이 나와</div>
            </>) : (<>
              <div style={{ fontSize:36, marginBottom:12 }}>💡</div>
              <div style={{ fontSize:18, fontWeight:900, marginBottom:12 }}>{foodChampion.name} 상식</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.85)", lineHeight:1.7 }}>{foodChampion.trivia}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:12 }}>탭하면 돌아가</div>
            </>)}
          </div>
        </div>

        {/* 후식 추천 애니메이션 */}
        {afterPhase !== "idle" && (() => {
          const af = getAfterFood(foodChampion);
          const allDotsOn = afterDots.every(Boolean);
          const rand = (min, max) => Math.random() * (max - min) + min;
          return (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"100%", marginBottom:16 }}>
              {/* 점 3개 */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"16px 0" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:12, height:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {afterDots[i] && (
                      <div style={{
                        width:10, height:10, borderRadius:"50%", background: afterPhase === "show" ? "#999" : "#888",
                        opacity: afterPhase === "show" ? 0.45 : 1,
                        animation: afterPhase === "dots" ? (allDotsOn ? `dotGlow 0.65s ease-in-out ${i*0.1}s infinite` : `dotDrop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards`) : "none",
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* 후식 카드 + 연기 효과 */}
              {afterPhase === "show" && (
                <div style={{ position:"relative", width:"100%", overflow:"visible", minHeight:180 }}>
                  {/* 연기 블롭 22개 — 카드 중앙에서 퍼엉 퍼져나감 */}
                  <div key={afterBurstKey} style={{ position:"absolute", left:"50%", top:"50%", width:0, height:0, zIndex:10, pointerEvents:"none", overflow:"visible" }}>
                    {Array.from({length:22}).map((_, i) => {
                      const angle = (i / 22) * 360 + rand(-10, 10);
                      const rad = (angle * Math.PI) / 180;
                      const hw = 150, hh = 90;
                      const ox = Math.cos(rad) * hw * rand(0.15, 0.4) + "px";
                      const oy = Math.sin(rad) * hh * rand(0.15, 0.4) + "px";
                      const tx = Math.cos(rad) * hw * rand(0.9, 1.3) + rand(-12,12) + "px";
                      const ty = Math.sin(rad) * hh * rand(0.9, 1.3) + rand(-12,12) + "px";
                      const ex = Math.cos(rad) * hw * rand(1.8, 2.8) + rand(-18,18) + "px";
                      const ey = Math.sin(rad) * hh * rand(1.8, 2.8) + rand(-18,18) - rand(10,40) + "px";
                      const size = rand(70, 150);
                      const grays = [
                        "rgba(218,215,211,0.85)","rgba(203,200,196,0.8)",
                        "rgba(230,227,223,0.82)","rgba(188,185,181,0.76)",
                        "rgba(238,235,231,0.74)",
                      ];
                      return (
                        <div key={i} className="smoke-blob" style={{
                          width:size, height:size,
                          marginLeft:-size/2, marginTop:-size/2,
                          background:grays[i%grays.length],
                          filter:"blur(18px)",
                          "--ox":ox, "--oy":oy,
                          "--tx":tx, "--ty":ty,
                          "--ex":ex, "--ey":ey,
                          "--dur":rand(1.3,2.2)+"s",
                          "--delay":rand(0,0.15)+"s",
                        }} />
                      );
                    })}
                  </div>

                  {/* 후식 카드 — 연기 뒤에서 스으윽 */}
                  <div key={afterBurstKey + "-card"} style={{
                    width:"100%", borderRadius:20, padding:"26px 20px",
                    background:"#fff", boxShadow:"0 8px 32px rgba(0,0,0,0.11)",
                    border:"1.5px solid #E8E5E0", textAlign:"center",
                    position:"relative", zIndex:5,
                    animation:"cardShaar 1.4s cubic-bezier(0.22,1,0.36,1) forwards",
                  }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#bbb", letterSpacing:1.5, marginBottom:10, animation:"fadeIn 0.4s ease-out 0.5s forwards", opacity:0 }}>🎉 후식 추천</div>
                    <div style={{ fontSize:48, marginBottom:6, animation:"fadeIn 0.4s ease-out 0.7s forwards", opacity:0 }}>{af.emoji}</div>
                    <div style={{ fontSize:19, fontWeight:900, color:"#191919", marginBottom:5, animation:"fadeIn 0.4s ease-out 0.85s forwards", opacity:0 }}>{af.name}</div>
                    <div style={{ fontSize:13, color:"#888", fontWeight:600, animation:"fadeIn 0.4s ease-out 1.0s forwards", opacity:0 }}>{af.reason}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 패자부활전 */}
        {!showFoodRunnerUps && foodTourneyHistory.length > 0 && (
          <button onClick={() => setShowFoodRunnerUps(true)} style={{
            width:"100%", padding:"14px", marginBottom:8,
            background:"#FAFAF8", border:"1.5px dashed #D0CEC8",
            borderRadius:14, fontSize:14, fontWeight:700,
            color:"#888", cursor:"pointer", fontFamily:"inherit",
          }}>
            🔄 이거 말고 다른 것도 볼래?
          </button>
        )}
        {showFoodRunnerUps && (() => {
          const losers = foodTourneyHistory
            .filter(f => f.id !== foodChampion.id)
            .reduce((acc, f) => { if (!acc.find(a => a.id === f.id)) acc.push(f); return acc; }, [])
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 4);
          return (
            <div style={{ marginBottom:12, animation:"fadeIn 0.3s ease-out" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#999", marginBottom:10 }}>아까 아쉽게 탈락한 것들</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                {losers.map(f => (
                  <div key={f.id} onClick={() => {
                setFoodChampion(f); setShowFoodRunnerUps(false); setFlippedFoods(new Set());
                // 후식 애니메이션 재트리거
                setAfterPhase("idle"); setAfterDots([false,false,false]);
                afterTimers.current.forEach(clearTimeout); afterTimers.current = [];
                const t1 = setTimeout(() => { setAfterPhase("dots"); setAfterDots([true,false,false]); }, 800);
                const t2 = setTimeout(() => setAfterDots([true,true,false]), 1300);
                const t3 = setTimeout(() => setAfterDots([true,true,true]), 1800);
                const t4 = setTimeout(() => { setAfterBurstKey(k => k+1); setAfterPhase("show"); }, 2400);
                afterTimers.current = [t1,t2,t3,t4];
              }} style={{
                    background:"#fff", borderRadius:16, padding:"18px 14px",
                    textAlign:"center", cursor:"pointer",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
                    border:"1.5px solid #ECEAE4",
                  }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>{f.emoji}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#191919" }}>{f.name}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowFoodRunnerUps(false)} style={{
                width:"100%", marginTop:10, padding:"10px",
                background:"transparent", border:"none",
                fontSize:12, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
              }}>닫기</button>
            </div>
          );
        })()}

        {/* 어디가지 연결 버튼 */}
        <button onClick={() => goToPlaceFromContext({ from:"whatToEat", food: foodChampion })} style={{
          width:"100%", padding:"15px", marginBottom:8,
          background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border:"none", borderRadius:14, fontSize:15, fontWeight:700,
          cursor:"pointer", fontFamily:"inherit", color:"#fff"
        }}>📍 이거 어디서 먹지?</button>

        <button onClick={() => { setFoodStep(0); setFoodAnswers({}); setFoodChampion(null); setFlippedFoods(new Set()); setFoodScreen("wcQuestions"); }} style={{
          width:"100%", padding:"15px", background:"#191919", color:"#fff",
          border:"none", borderRadius:14, fontSize:15, fontWeight:700,
          cursor:"pointer", fontFamily:"inherit", marginBottom:8
        }}>
          다시 하기
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
  );
}
