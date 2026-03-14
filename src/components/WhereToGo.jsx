import React, { useState, useEffect } from "react";
import { places } from '../data/places.js';

// 기분 → vibe 매핑
const PLACE_MOOD_VIBES = {
  chill: ["고요함","힐링","평화로움","느긋함","편안한"],
  active: ["활동적","신나는","재미","해방감","성취감"],
  romantic: ["감성","로맨틱","특별함","영감","지적"],
  random: [],
};

export default function WhereToGo({ sodaKeys, setSodaKeys, sodaColorRef, onHideTabBar, pendingPlaceContext, onClearPendingContext }) {
  // ── 장소 탭 상태 ──
  const [placeScreen, setPlaceScreen] = useState("home"); // home | setup | tournament | result
  const [placeResult, setPlaceResult] = useState(null); // { main, alternatives }
  const [placeAnswers, setPlaceAnswers] = useState({ who: null, inOut: null, budget: null, mood: null });
  const [placeContext, setPlaceContext] = useState(null); // { from: "whatToDo"|"whatToEat", activity?, food? }
  // 장소 토너먼트 상태
  const [placeBracket, setPlaceBracket] = useState([]);
  const [placeMatchIdx, setPlaceMatchIdx] = useState(0);
  const [placeRoundWinners, setPlaceRoundWinners] = useState([]);
  const [placeChampion, setPlaceChampion] = useState(null);
  const [placePicking, setPlacePicking] = useState(null);
  const [placeTourneyHistory, setPlaceTourneyHistory] = useState([]);

  // pendingPlaceContext를 감지해서 적용
  useEffect(() => {
    if (pendingPlaceContext) {
      setPlaceAnswers(pendingPlaceContext.placeAnswers);
      setPlaceContext(pendingPlaceContext.placeContext);
      setPlaceScreen("setup");
      onClearPendingContext();
    }
  }, [pendingPlaceContext, onClearPendingContext]);

  // 토너먼트 화면일 때 탭바 숨기기
  useEffect(() => {
    if (placeScreen === "tournament") {
      onHideTabBar(true);
    } else {
      onHideTabBar(false);
    }
    return () => onHideTabBar(false);
  }, [placeScreen, onHideTabBar]);

  // 장소 추천 핵심 함수
  function doPlaceRecommend(pa, ctx) {
    const hour = new Date().getHours();
    const curSlot = hour < 6 ? "night" : hour < 11 ? "morning" : hour < 14 ? "afternoon" : hour < 18 ? "afternoon" : hour < 21 ? "evening" : "night";
    const moodVibes = PLACE_MOOD_VIBES[pa?.mood] || [];

    // 1단계: 하드 필터
    const filtered = places.filter(p => {
      if (p.timeSlots && !p.timeSlots.includes(curSlot)) return false;
      if (pa?.inOut === "indoor" && p.type.includes("outdoor") && !p.type.includes("indoor")) return false;
      if (pa?.inOut === "outdoor" && p.type.includes("indoor") && !p.type.includes("outdoor")) return false;
      if (pa?.who === "alone" && p.withWho && !p.withWho.includes("alone")) return false;
      return true;
    });

    const pool = filtered.length >= 3 ? filtered : places.filter(p => {
      if (pa?.who === "alone" && p.withWho && !p.withWho.includes("alone")) return false;
      return true;
    });

    // 2단계: 스코어링
    const scored = pool.map(p => {
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
        if (ctx.activity.vibe && p.vibe?.some(v => ctx.activity.vibe.includes(v))) score += 3;
      }
      if (ctx?.from === "whatToEat") {
        if (p.tags?.some(t => ["맛집","먹방","먹거리"].includes(t))) score += 4;
        if (["맛집 탐방","전통시장","포장마차/야시장"].includes(p.name)) score += 3;
      }

      score += Math.random() * 1.5;
      return { place: p, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // 추천 이유 생성
    const reasons = [];
    if (ctx?.from === "whatToDo") reasons.push(`${ctx.activity?.emoji || "✨"} ${ctx.activity?.name} 하기 좋은 곳`);
    else if (ctx?.from === "whatToEat") reasons.push(`${ctx.food?.emoji || "🍽️"} ${ctx.food?.name || "맛집"} 먹으러`);
    else {
      const moodLabel = { chill:"조용히 쉬고 싶을 때", active:"활동적으로 놀 때", romantic:"감성 충전" };
      if (pa?.mood && moodLabel[pa.mood]) reasons.push(moodLabel[pa.mood]);
    }
    const slotLabel = { morning:"아침", afternoon:"오후", evening:"저녁", night:"늦은 밤" };
    reasons.push(slotLabel[curSlot] + " 시간대");
    const whoLabel = { alone:"혼자", partner:"연인과 함께", family:"가족과 함께", friend:"친구와 함께" };
    if (pa?.who && whoLabel[pa.who]) reasons.push(whoLabel[pa.who]);

    setPlaceResult({
      main: scored[0]?.place,
      alternatives: scored.slice(1, 4).map(s => s.place),
      reason: reasons.join(" · "),
    });
    setPlaceScreen("result");
  }

  // 장소 토너먼트: 후보 필터링 + 시작
  function startPlaceTournament(pa, ctx) {
    const hour = new Date().getHours();
    const curSlot = hour < 6 ? "night" : hour < 11 ? "morning" : hour < 14 ? "afternoon" : hour < 18 ? "afternoon" : hour < 21 ? "evening" : "night";
    const moodVibes = PLACE_MOOD_VIBES[pa?.mood] || [];

    // 필터: 시간대 + 실내/야외 + 누구랑
    const filtered = places.filter(p => {
      if (p.timeSlots && !p.timeSlots.includes(curSlot)) return false;
      if (pa?.inOut === "indoor" && p.type.includes("outdoor") && !p.type.includes("indoor")) return false;
      if (pa?.inOut === "outdoor" && p.type.includes("indoor") && !p.type.includes("outdoor")) return false;
      if (pa?.who === "alone" && p.withWho && !p.withWho.includes("alone")) return false;
      return true;
    });
    const pool = filtered.length >= 8 ? filtered : places;

    // 스코어 기반 정렬
    const scored = pool.map(p => {
      let score = 0;
      if (moodVibes.length > 0) score += p.vibe.filter(v => moodVibes.includes(v)).length * 3;
      if (p.timeSlots?.includes(curSlot)) score += 2;
      if (pa?.who && p.withWho?.includes(pa.who)) score += 2;
      if (pa?.budget && p.budget?.includes(pa.budget)) score += 1;
      if (ctx?.from === "whatToDo" && ctx.activity?.vibe) {
        score += p.vibe.filter(v => ctx.activity.vibe.includes(v)).length * 2;
      }
      if (ctx?.from === "whatToEat" && p.tags?.some(t => ["맛집","먹방","먹거리"].includes(t))) score += 3;
      score += Math.random() * 1;
      return { ...p, score };
    }).sort((a, b) => b.score - a.score);

    const bracket = [...scored.slice(0, 24)].sort(() => Math.random() - 0.5).slice(0, 16);
    setPlaceBracket(bracket);
    setPlaceMatchIdx(0);
    setPlaceRoundWinners([]);
    setPlaceChampion(null);
    setPlacePicking(null);
    setPlaceTourneyHistory([]);
    setPlaceScreen("tournament");
  }

  function pickPlaceWinner(winner, side) {
    if (placePicking) return;
    setPlacePicking(side);
    const PC = [
      ["#eff6ff","#667eea"],["#f5f3ff","#764ba2"],["#f0fdf4","#22d3a5"],
      ["#fff7ed","#f97316"],["#fefce8","#facc15"],["#ecfdf5","#34d399"],
    ];
    sodaColorRef.current._placeTourney = PC[Math.floor(Math.random() * PC.length)];
    setSodaKeys(p => ({ ...p, _placeTourney: (p._placeTourney || 0) + 1 }));
    setPlaceTourneyHistory(h => [...h, winner]);
    setTimeout(() => {
      const newW = [...placeRoundWinners, winner];
      const nextIdx = placeMatchIdx + 2;
      if (nextIdx >= placeBracket.length) {
        if (newW.length === 1) {
          setPlaceChampion(newW[0]);
          setPlacePicking(null);
          setPlaceScreen("result");
          // 챔피언을 메인으로 한 결과 세팅
          const alts = placeTourneyHistory
            .filter(p => p.id !== newW[0].id)
            .reduce((acc, p) => { if (!acc.find(a => a.id === p.id)) acc.push(p); return acc; }, [])
            .slice(-3);
          setPlaceResult({
            main: newW[0],
            alternatives: alts,
            reason: "취향 장소 찾기 우승",
          });
        } else {
          setPlacePicking(null);
          setPlaceBracket(newW);
          setPlaceMatchIdx(0);
          setPlaceRoundWinners([]);
        }
      } else {
        setPlacePicking(null);
        setPlaceMatchIdx(nextIdx);
        setPlaceRoundWinners(newW);
      }
    }, 900);
  }

  return (
    <>
      {/* 홈 화면 */}
      {placeScreen === "home" && (
        <div className="screen fade-in" style={{ paddingTop:32 }}>
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px", marginBottom:8 }}>어디 가지? 📍</div>
          <div style={{ fontSize:14, color:"#999", marginBottom:28 }}>지금 기분에 맞는 장소를 찾아줄게</div>

          <div style={{ fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:1.5, marginBottom:10 }}>빠른 추천</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
            {[
              { id:"chill", emoji:"😌", label:"조용히 쉬고 싶어" },
              { id:"active", emoji:"⚡", label:"활동적으로 놀래" },
              { id:"romantic", emoji:"💕", label:"감성 충전" },
              { id:"random", emoji:"🎲", label:"아무데나 골라줘" },
            ].map(m => (
              <button key={m.id} onClick={() => doPlaceRecommend({ mood:m.id }, null)} style={{
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

          <button onClick={() => startPlaceTournament({}, null)} style={{
            width:"100%", padding:17, marginBottom:10,
            background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border:"none", borderRadius:16,
            fontSize:16, fontWeight:800, color:"#fff",
            cursor:"pointer", fontFamily:"inherit",
            boxShadow:"0 4px 14px rgba(102,126,234,0.3)"
          }}>
            🏆 내 취향 장소 찾기
          </button>

          <button onClick={() => { setPlaceAnswers({ who:null, inOut:null, budget:null, mood:null }); setPlaceContext(null); setPlaceScreen("setup"); }} style={{
            width:"100%", padding:15, background:"#fff",
            border:"1.5px solid #E0DED8", borderRadius:16,
            fontSize:15, fontWeight:700, color:"#555",
            cursor:"pointer", fontFamily:"inherit"
          }}>
            🎯 세부 설정하고 추천받기
          </button>
        </div>
      )}

      {/* 세부 설정 화면 */}
      {placeScreen === "setup" && (
        <div className="screen fade-in">
          <div style={{ marginBottom:28, paddingTop:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px" }}>어디 가지? 📍</div>
              <button onClick={() => { setPlaceScreen("home"); setPlaceContext(null); }} style={{
                padding:"6px 12px", borderRadius:100, border:"1.5px solid #E0DED8",
                background:"#fff", fontSize:11, fontWeight:700, color:"#aaa",
                cursor:"pointer", fontFamily:"inherit"
              }}>← 뒤로</button>
            </div>
            <div style={{ fontSize:14, color:"#999", marginTop:6 }}>
              {placeContext?.from === "whatToDo" ? `${placeContext.activity?.emoji || "✨"} ${placeContext.activity?.name} 하기 좋은 곳을 찾아줄게` :
               placeContext?.from === "whatToEat" ? `${placeContext.food?.emoji || "🍽️"} ${placeContext.food?.name || "맛집"} 먹으러 갈 곳을 찾아줄게` :
               "몇 가지만 알려주면 딱 맞는 곳 찾아줄게"}
            </div>
          </div>

          {placeContext && (
            <div style={{
              background:"#F5F3EE", borderRadius:14, padding:"10px 14px",
              marginBottom:16, fontSize:12, color:"#666", display:"flex",
              alignItems:"center", justifyContent:"space-between"
            }}>
              <span>
                {placeContext.from === "whatToDo" ? "✨ 뭐할까에서 연결됨" : "🍽️ 뭐먹지에서 연결됨"}
                {" — 답변이 자동으로 채워졌어"}
              </span>
              <button onClick={() => { setPlaceContext(null); setPlaceAnswers({ who:null, inOut:null, budget:null, mood:null }); }} style={{
                background:"none", border:"none", fontSize:11, color:"#aaa", cursor:"pointer", fontFamily:"inherit"
              }}>초기화</button>
            </div>
          )}

          {[
            { id:"who", label:"누구랑 갈 거야?", options:[
              { value:"alone", label:"🙋 혼자" },
              { value:"partner", label:"💑 연인" },
              { value:"friend", label:"👯 친구" },
              { value:"family", label:"👨‍👩‍👧 가족" },
            ]},
            { id:"inOut", label:"실내? 야외?", options:[
              { value:"indoor", label:"🏠 실내가 좋아" },
              { value:"outdoor", label:"🌳 밖으로 나갈래" },
              { value:"both", label:"🤷 상관없어" },
            ]},
            { id:"budget", label:"예산은?", options:[
              { value:"low", label:"🆓 가볍게" },
              { value:"mid", label:"💸 적당히" },
              { value:"high", label:"💳 넉넉하게" },
            ]},
            { id:"mood", label:"어떤 느낌이 좋아?", options:[
              { value:"chill", label:"😌 조용히 쉬고 싶어" },
              { value:"active", label:"⚡ 활동적으로 놀래" },
              { value:"romantic", label:"💕 감성 충전" },
              { value:"random", label:"🎲 아무데나" },
            ]},
          ].map(q => (
            <div key={q.id} className="q-card">
              <div className="q-label">{q.label}</div>
              <div className="opt-row">
                {q.options.map(opt => (
                  <button key={opt.value}
                    className={`opt-btn ${placeAnswers[q.id] === opt.value ? "selected" : ""}`}
                    onClick={() => setPlaceAnswers(pa => ({ ...pa, [q.id]: opt.value }))}
                  >
                    <span className="opt-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button className="start-btn"
            disabled={!placeAnswers.who || !placeAnswers.mood}
            onClick={() => doPlaceRecommend(placeAnswers, placeContext)}
          >
            {placeAnswers.who && placeAnswers.mood ? "장소 추천받기 →" : "누구랑, 기분만 알려줘"}
          </button>
          {placeAnswers.who && placeAnswers.mood && (
            <button onClick={() => startPlaceTournament(placeAnswers, placeContext)} style={{
              width:"100%", marginTop:10, padding:"16px",
              background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border:"none", borderRadius:16, fontSize:15, fontWeight:800,
              color:"#fff", cursor:"pointer", fontFamily:"inherit",
              boxShadow:"0 4px 14px rgba(102,126,234,0.3)"
            }}>
              🏆 내 취향 장소 찾기
            </button>
          )}
        </div>
      )}

      {/* 토너먼트 화면 */}
      {placeScreen === "tournament" && (() => {
        const pPair = placeBracket.slice(placeMatchIdx, placeMatchIdx + 2);
        const pTotal = placeBracket.length / 2;
        const pCurrent = Math.floor(placeMatchIdx / 2) + 1;
        const getPlaceRoundLabel = () => {
          if (placeBracket.length === 16) return `16강 · ${pCurrent}/${pTotal}`;
          if (placeBracket.length === 8) return `8강 · ${pCurrent}/${pTotal}`;
          if (placeBracket.length === 4) return `4강 · ${pCurrent}/${pTotal}`;
          if (placeBracket.length === 2) return "🏆 결승!";
          return `${pCurrent}/${pTotal}`;
        };
        if (pPair.length < 2) return null;
        const ptc = sodaColorRef.current._placeTourney || ["#eff6ff","#667eea"];
        const ptk = sodaKeys._placeTourney || 0;
        const TB = [
          {left:"10%",size:5,dur:3.0,delay:0.2},{left:"22%",size:8,dur:2.6,delay:0.7},
          {left:"35%",size:4,dur:3.4,delay:1.3},{left:"48%",size:9,dur:2.8,delay:0.5},
          {left:"62%",size:6,dur:3.2,delay:1.0},{left:"75%",size:4,dur:2.9,delay:1.6},
          {left:"85%",size:7,dur:3.1,delay:0.4},{left:"50%",size:5,dur:2.7,delay:1.8},
        ];
        return (
          <div className="tournament-screen fade-in">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${(pCurrent / pTotal) * 100}%` }} />
            </div>
            <div className="match-label">{getPlaceRoundLabel()}</div>
            <div className="cards-wrap">
              {[["left", pPair[0]], ["right", pPair[1]]].map(([side, place], idx) => {
                if (!place) return null;
                const isPicked = placePicking === side;
                const isOther = placePicking && placePicking !== side;
                return (
                  <React.Fragment key={side}>
                    {idx === 1 && <div className="vs-divider">VS</div>}
                    <div className={`toss-card${isPicked ? " picking-"+side : ""}`}
                      onClick={() => pickPlaceWinner(place, side)}
                      style={{
                        opacity: isOther ? 0.4 : 1,
                        transition:"opacity 0.3s ease, transform 0.25s",
                        overflow:"hidden", position:"relative",
                        animation: isPicked ? "shakeCan 0.55s ease" : "none",
                      }}
                    >
                      {isPicked && (<>
                        <div className="liquid" key={ptk} style={{ position:"absolute", left:-4, right:-4, bottom:-50, top:-30, animation:"liquidRise 1.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards", zIndex:1 }}>
                          <div style={{ position:"absolute", top:0, left:0, right:0, height:24, overflow:"hidden" }}>
                            <svg style={{ width:"200%", height:24, display:"block", animation:"waveScroll 2s linear infinite" }} viewBox="0 0 200 24" preserveAspectRatio="none">
                              <path d="M0,12 C25,2 50,22 75,12 C100,2 125,22 150,12 C175,2 200,22 200,12 L200,24 L0,24 Z" fill={ptc[0]} />
                            </svg>
                          </div>
                          <div style={{ position:"absolute", inset:0, top:18, background:`linear-gradient(180deg, ${ptc[0]} 0%, ${ptc[1]} 100%)` }} />
                        </div>
                        {TB.map((b, i) => (
                          <div key={`pt${ptk}-b${i}`} style={{
                            position:"absolute", width:b.size, height:b.size, left:b.left,
                            bottom:`${6+(i%6)*4}%`, borderRadius:"50%",
                            background:"rgba(255,255,255,0.78)", zIndex:3,
                            animation:`bubbleFloat ${b.dur}s ease-out ${b.delay}s infinite`,
                            opacity:0, "--drift":`${((i%5)-2)*5}px`, pointerEvents:"none",
                          }} />
                        ))}
                      </>)}
                      <div className="card-emoji" style={{ position:"relative", zIndex:4 }}>{place.emoji}</div>
                      <div className="card-name" style={{ position:"relative", zIndex:4 }}>{place.name}</div>
                      <div className="card-time" style={{ position:"relative", zIndex:4 }}>
                        {place.stayDuration >= 60 ? `${Math.floor(place.stayDuration/60)}시간${place.stayDuration%60>0?` ${place.stayDuration%60}분`:""}` : `${place.stayDuration}분`}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <button style={{ background:"transparent", border:"none", color:"#bbb", fontSize:13, cursor:"pointer", marginTop:24, width:"100%", fontFamily:"inherit" }}
              onClick={() => setPlaceScreen("setup")}>← 그만하기</button>
          </div>
        );
      })()}

      {/* 결과 화면 */}
      {placeScreen === "result" && placeResult && (
        <div className="screen fade-in" style={{ paddingTop:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <button onClick={() => setPlaceScreen(placeAnswers.who ? "setup" : "home")} style={{
              background:"none", border:"none", fontSize:20, cursor:"pointer", padding:4
            }}>←</button>
            <div style={{ fontSize:20, fontWeight:800 }}>추천 장소</div>
          </div>

          {/* context 안내 */}
          {placeContext && (
            <div style={{
              background:"linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
              borderRadius:14, padding:"12px 16px", marginBottom:16,
              display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#555"
            }}>
              <span style={{ fontSize:20 }}>{placeContext.from === "whatToDo" ? "✨" : "🍽️"}</span>
              <span>
                {placeContext.from === "whatToDo"
                  ? `${placeContext.activity?.name}에 어울리는 장소야`
                  : `${placeContext.food?.name || "맛집"} 먹기 좋은 곳이야`}
              </span>
            </div>
          )}

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
              {placeResult.main.tags?.map(tag => (
                <span key={tag} style={{
                  background:"rgba(255,255,255,0.2)", borderRadius:20,
                  padding:"4px 10px", fontSize:11, color:"#fff"
                }}>#{tag}</span>
              ))}
            </div>
            {placeResult.main.stayDuration && (
              <div style={{ marginTop:12, fontSize:12, opacity:0.6 }}>
                평균 체류 {placeResult.main.stayDuration >= 60 ? `${Math.floor(placeResult.main.stayDuration/60)}시간${placeResult.main.stayDuration%60 > 0 ? ` ${placeResult.main.stayDuration%60}분` : ""}` : `${placeResult.main.stayDuration}분`}
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(placeResult.main.name + " 근처")}`}
                target="_blank" rel="noopener noreferrer" style={{
                  flex:1, padding:"10px", borderRadius:10, background:"rgba(255,255,255,0.2)",
                  color:"#fff", fontSize:12, fontWeight:700, textAlign:"center",
                  textDecoration:"none", border:"1px solid rgba(255,255,255,0.3)"
                }}>📍 구글맵</a>
              <a href={`https://map.kakao.com/link/search/${encodeURIComponent(placeResult.main.name)}`}
                target="_blank" rel="noopener noreferrer" style={{
                  flex:1, padding:"10px", borderRadius:10, background:"rgba(255,255,255,0.2)",
                  color:"#fff", fontSize:12, fontWeight:700, textAlign:"center",
                  textDecoration:"none", border:"1px solid rgba(255,255,255,0.3)"
                }}>🗺️ 카카오맵</a>
            </div>
          </div>

          {/* 대안 */}
          {placeResult.alternatives.length > 0 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:"#999", marginBottom:10 }}>이런 곳도 있어요</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {placeResult.alternatives.map(p => (
                  <div key={p.id} style={{
                    background:"#fff", borderRadius:14, padding:"16px 18px",
                    display:"flex", alignItems:"center", gap:12,
                    boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ fontSize:28 }}>{p.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{p.name}</div>
                      <div style={{ fontSize:12, color:"#aaa", lineHeight:1.4 }}>{p.summary}</div>
                      <div style={{ display:"flex", gap:4, marginTop:6, flexWrap:"wrap" }}>
                        {p.tags?.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            background:"#F5F3EE", borderRadius:10,
                            padding:"2px 8px", fontSize:10, color:"#999"
                          }}>#{tag}</span>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:6, marginTop:8 }}>
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent(p.name + " 근처")}`}
                          target="_blank" rel="noopener noreferrer" style={{
                            padding:"4px 10px", borderRadius:8, background:"#F5F3EE",
                            fontSize:10, fontWeight:700, color:"#888", textDecoration:"none"
                          }}>📍 구글맵</a>
                        <a href={`https://map.kakao.com/link/search/${encodeURIComponent(p.name)}`}
                          target="_blank" rel="noopener noreferrer" style={{
                            padding:"4px 10px", borderRadius:8, background:"#F5F3EE",
                            fontSize:10, fontWeight:700, color:"#888", textDecoration:"none"
                          }}>🗺️ 카카오맵</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 하단 버튼들 */}
          <div style={{ display:"flex", gap:10, marginBottom:10 }}>
            <button onClick={() => doPlaceRecommend(placeAnswers, placeContext)} style={{
              flex:1, padding:"14px", borderRadius:12, border:"none",
              background:"#191919", fontSize:14, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", color:"#fff"
            }}>🔄 다시 추천</button>
            <button onClick={() => { setPlaceScreen("setup"); }} style={{
              flex:1, padding:"14px", borderRadius:12, border:"none",
              background:"#F5F3F0", fontSize:14, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", color:"#2D2D2D"
            }}>⚙ 다시 설정</button>
          </div>
          <button onClick={() => { setPlaceScreen("home"); setPlaceContext(null); setPlaceAnswers({ who:null, inOut:null, budget:null, mood:null }); }} style={{
            width:"100%", padding:"12px", background:"transparent", border:"none",
            fontSize:13, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
          }}>
            🏠 처음으로
          </button>
        </div>
      )}
    </>
  );
}
