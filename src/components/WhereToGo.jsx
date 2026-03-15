import React, { useState, useEffect } from "react";
import { recommendPlace, buildTournamentBracket } from '../features/whereToGo/engine.js';
import TournamentCard from './shared/TournamentCard.jsx';
import { SODA_COLORS } from './whatToDo/constants.js';

// 장소 이름 → 실제 지도 검색어 매핑 ("내 근처" 쓰지 않음 — 좌표로 위치 전달)
function getMapQuery(name) {
  const map = {
    "조용한 카페": "카페",
    "분위기 카페": "분위기 카페",
    "작업하기 좋은 카페": "카페",
    "디저트 카페": "디저트 카페",
    "루프탑 카페": "루프탑 카페",
    "브런치 카페": "브런치",
    "동네 카페": "카페",
    "테이크아웃 커피": "카페",
    "애견동반 카페": "애견카페",
    "대형 프랜차이즈 카페": "스타벅스",
    "공원/하천": "공원",
    "해변/강변": "해변",
    "수목원/식물원": "수목원",
    "짧게 걷기 좋은 동네": "산책로",
    "야경 스팟": "야경",
    "전망대/타워": "전망대",
    "한강공원": "한강공원",
    "호수공원": "호수공원",
    "둘레길/산책로": "둘레길",
    "옥상정원/스카이가든": "옥상정원",
    "드라이브 코스": "드라이브",
    "야간 드라이브": "야경 드라이브",
    "드라이브스루": "드라이브스루",
    "해안도로": "해안도로",
    "서점/독서카페": "독서카페",
    "독립서점": "독립서점",
    "대형서점": "교보문고",
    "도서관": "도서관",
    "전시회/갤러리": "전시회",
    "영화관": "영화관",
    "박물관/과학관": "박물관",
    "공연/뮤지컬": "공연",
    "만화카페/멀티방": "만화카페",
    "복합문화공간": "문화센터",
    "백화점": "백화점",
    "쇼핑몰/아울렛": "쇼핑몰",
    "빈티지/플리마켓": "플리마켓",
    "대형마트": "대형마트",
    "다이소/문구점": "다이소",
    "올리브영/드럭스토어": "올리브영",
    "전통시장": "전통시장",
    "편집샵/셀렉트샵": "편집샵",
    "맛집 탐방": "맛집",
    "포장마차/야시장": "야시장",
    "바/펍": "펍",
    "와인바/칵테일바": "와인바",
    "편의점 앞 벤치": "편의점",
    "고깃집": "고기 맛집",
    "회전초밥/혼밥집": "혼밥 맛집",
    "푸드코트": "푸드코트",
    "한강 치맥 스팟": "치킨",
    "오션뷰 맛집": "오션뷰 맛집",
    "24시 식당": "24시 식당",
    "찜닭골목/먹자골목": "먹자골목",
    "베이커리/빵집": "빵집",
    "분식집": "분식",
    "카페거리": "카페거리",
    "무인매장/편의점": "편의점",
    "찜질방/사우나": "찜질방",
    "온천/스파": "스파",
    "명상센터": "명상",
    "스터디카페": "스터디카페",
    "24시 카페": "24시 카페",
    "24시 찜질방": "24시 찜질방",
    "반려동물 카페": "반려동물 카페",
    "사진관/셀프스튜디오": "셀프스튜디오",
    "쿠킹클래스/원데이클래스": "원데이클래스",
  };
  if (map[name]) return map[name];
  // 슬래시가 있으면 첫 번째만
  return name.split("/")[0].replace(/\(.*\)/, "").trim();
}

// 카카오맵 열기 (현재 위치 기반)
function openKakaoMap(query) {
  const encoded = encodeURIComponent(query);
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

  if (isMobile && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        window.location.href = `kakaomap://search?q=${encoded}&p=${latitude},${longitude}`;
      },
      () => {
        // 위치 권한 거부 시 좌표 없이
        window.location.href = `kakaomap://search?q=${encoded}`;
      },
      { timeout: 3000 }
    );
  } else if (isMobile) {
    window.location.href = `kakaomap://search?q=${encoded}`;
  } else {
    window.open(`https://map.kakao.com/link/search/${encoded}`, "_blank");
  }
}

export default function WhereToGo({ sodaKeys, setSodaKeys, sodaColorRef, onHideTabBar, pendingPlaceContext, onClearPendingContext }) {
  // ── 장소 탭 상태 ──
  const [placeScreen, setPlaceScreen] = useState("home"); // home | setup | tournament | result
  const [placeResult, setPlaceResult] = useState(null); // { main, alternatives }
  const [placeAnswers, setPlaceAnswers] = useState({ who: null, inOut: null, budget: null, mood: null });
  const [placeContext, setPlaceContext] = useState(null); // { from: "whatToDo"|"whatToEat", activity?, food? }
  const [showStayHomeNudge, setShowStayHomeNudge] = useState(false);
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
      if (pendingPlaceContext.stayHome) {
        // "집에 있을 거야" 선택 시 넛지 표시
        setShowStayHomeNudge(true);
        setPlaceContext(pendingPlaceContext.placeContext);
      } else {
        setShowStayHomeNudge(false);
      }
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

  // 장소 추천 (engine.js 사용)
  function doPlaceRecommend(pa, ctx) {
    const result = recommendPlace(pa, ctx);
    setPlaceResult(result);
    setPlaceScreen("result");
  }

  // 장소 토너먼트 시작 (engine.js 사용)
  function startPlaceTournament(pa, ctx, bracketSize = 16) {
    const bracket = buildTournamentBracket(pa, ctx, bracketSize);
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
    sodaColorRef.current._placeTourney = SODA_COLORS[Math.floor(Math.random() * SODA_COLORS.length)];
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
          <div style={{ fontSize:14, color:"var(--text-main)", opacity:0.75, marginBottom:28 }}>나가고 싶은데 어딜 갈지 모르겠지? 내가 찾아줄게</div>

          <div style={{ fontSize:11, fontWeight:700, color:"var(--text-sub)", letterSpacing:1.5, marginBottom:10 }}>지금 기분이 어때?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
            {[
              { id:"chill", emoji:"😌", label:"조용히 쉬고 싶어" },
              { id:"active", emoji:"⚡", label:"활동적으로 놀래" },
              { id:"romantic", emoji:"💕", label:"감성 충전" },
              { id:"random", emoji:"🎲", label:"아무데나 골라줘" },
            ].map(m => (
              <button key={m.id} onClick={() => doPlaceRecommend({ mood:m.id }, null)} style={{
                background:"var(--bg-card)", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:16, padding:"20px 18px",
                display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                fontFamily:"inherit", boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
                textAlign:"left", transition:"transform 0.15s"
              }} onPointerDown={e => e.currentTarget.style.transform="scale(0.97)"}
                 onPointerUp={e => e.currentTarget.style.transform="scale(1)"}
                 onPointerLeave={e => e.currentTarget.style.transform="scale(1)"}>
                <div style={{ fontSize:28 }}>{m.emoji}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{m.label}</div>
              </button>
            ))}
          </div>

          <div style={{ fontSize:11, fontWeight:700, color:"var(--text-sub)", letterSpacing:1.5, marginBottom:10 }}>진지하게 고를래?</div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[
              { size:4, label:"빠르게", sub:"2번이면 끝", emoji:"🚀" },
              { size:8, label:"적당히", sub:"7번 고르기", emoji:"⚡" },
              { size:16, label:"제대로", sub:"15번 풀코스", emoji:"🏆" },
            ].map(r => (
              <button key={r.size} onClick={() => startPlaceTournament({}, null, r.size)} style={{
                flex:1, padding:"14px 8px", borderRadius:14,
                border:"1.5px solid var(--text-dim)", background:"var(--bg-card)",
                cursor:"pointer", fontFamily:"inherit",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              }}>
                <span style={{ fontSize:22 }}>{r.emoji}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--text-main)" }}>{r.label}</span>
                <span style={{ fontSize:10, color:"var(--text-sub)" }}>{r.sub}</span>
              </button>
            ))}
          </div>

          <button onClick={() => { setPlaceAnswers({ who:null, inOut:null, budget:null, mood:null }); setPlaceContext(null); setPlaceScreen("setup"); }} style={{
            width:"100%", padding:15, background:"var(--bg-card)",
            border:"1.5px solid var(--text-dim)", borderRadius:16,
            fontSize:15, fontWeight:700, color:"var(--text-sub)",
            cursor:"pointer", fontFamily:"inherit"
          }}>
            🎯 좀 더 구체적으로 알려줄게
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
                padding:"6px 12px", borderRadius:100, border:"1.5px solid var(--text-dim)",
                background:"var(--bg-card)", fontSize:11, fontWeight:700, color:"var(--text-sub)",
                cursor:"pointer", fontFamily:"inherit"
              }}>← 뒤로</button>
            </div>
            <div style={{ fontSize:14, color:"var(--text-sub)", marginTop:6 }}>
              {placeContext?.from === "whatToDo" && placeContext.activity?.tags?.location?.[0] === "home"
                ? `${placeContext.activity?.emoji || "✨"} ${placeContext.activity?.name}은(는) 집이 최고지! 전후로 잠깐 들를 곳 찾아줄게`
                : placeContext?.from === "whatToDo" ? `${placeContext.activity?.emoji || "✨"} ${placeContext.activity?.name} 전후로 가기 좋은 곳 찾아줄게` :
               placeContext?.from === "whatToEat" ? `${placeContext.food?.emoji || "🍽️"} ${placeContext.food?.name || "맛집"} 먹으러 갈 곳을 찾아줄게` :
               "몇 개만 답해봐, 딱 맞는 데 찾아줄게"}
            </div>
          </div>

          {showStayHomeNudge && (
            <div style={{
              background:"rgba(123,154,204,0.15)", borderRadius:14, padding:"14px 16px",
              marginBottom:16, fontSize:13, color:"var(--text-main)", lineHeight:1.6,
              border:"1px solid rgba(123,154,204,0.3)"
            }}>
              <div style={{ fontWeight:700, marginBottom:4 }}>🏠 집에 있고 싶다고?</div>
              <div style={{ color:"var(--text-sub)", fontSize:12 }}>
                하루종일 집에만 있으면 답답해지잖아. 잠깐만 나갔다 와.
                <br/>가까운 데 위주로 골라줄게.
              </div>
            </div>
          )}

          {placeContext && (
            <div style={{
              background:"var(--bg-card)", borderRadius:14, padding:"10px 14px",
              marginBottom:16, fontSize:12, color:"var(--text-sub)", display:"flex",
              alignItems:"center", justifyContent:"space-between"
            }}>
              <span>
                {placeContext.from === "whatToDo" ? "✨ 뭐할까에서 연결됨" : "🍽️ 뭐먹지에서 연결됨"}
                {" — 알아서 채워놨어"}
              </span>
              <button onClick={() => { setPlaceContext(null); setPlaceAnswers({ who:null, inOut:null, budget:null, mood:null }); }} style={{
                background:"none", border:"none", fontSize:11, color:"var(--text-dim)", cursor:"pointer", fontFamily:"inherit"
              }}>초기화</button>
            </div>
          )}

          {[
            { id:"who", label:"누구랑 가?", options:[
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
            { id:"budget", label:"돈은 얼마나 쓸 거야?", options:[
              { value:"low", label:"🆓 가볍게" },
              { value:"mid", label:"💸 적당히" },
              { value:"high", label:"💳 넉넉하게" },
            ]},
            { id:"mood", label:"오늘 어떤 느낌이야?", options:[
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
            {placeAnswers.who && placeAnswers.mood ? "좋아, 찾아볼게 →" : "누구랑 가는지, 기분만 알려줘"}
          </button>
          {placeAnswers.who && placeAnswers.mood && (
            <>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text-sub)", textAlign:"center", marginTop:16, marginBottom:8 }}>직접 골라볼래?</div>
              <div style={{ display:"flex", gap:8 }}>
                {[
                  { size:4, label:"빠르게", sub:"2번", emoji:"🚀" },
                  { size:8, label:"적당히", sub:"7번", emoji:"⚡" },
                  { size:16, label:"제대로", sub:"15번", emoji:"🏆" },
                ].map(r => (
                  <button key={r.size} onClick={() => startPlaceTournament(placeAnswers, placeContext, r.size)} style={{
                    flex:1, padding:"12px 6px", borderRadius:12,
                    border:"1.5px solid var(--text-dim)", background:"var(--bg-card-hover)",
                    cursor:"pointer", fontFamily:"inherit",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                    color:"var(--text-main)",
                  }}>
                    <span style={{ fontSize:18 }}>{r.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:700 }}>{r.label}</span>
                    <span style={{ fontSize:10, opacity:0.7 }}>{r.sub}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 토너먼트 화면 */}
      {placeScreen === "tournament" && placeBracket.length >= 2 && (
        <TournamentCard
          bracket={placeBracket} matchIdx={placeMatchIdx}
          picking={placePicking}
          colors={sodaColorRef.current._placeTourney || ["#eff6ff","#667eea"]}
          sodaKey={sodaKeys._placeTourney || 0}
          onPick={pickPlaceWinner}
          onBack={() => setPlaceScreen("setup")}
          backLabel="← 그만하기"
          renderInfo={(place) => (
            <>
              <div className="card-emoji" style={{ position:"relative", zIndex:4 }}>{place.emoji}</div>
              <div className="card-name" style={{ position:"relative", zIndex:4 }}>{place.name}</div>
              <div className="card-time" style={{ position:"relative", zIndex:4 }}>
                {place.stayDuration >= 60 ? `${Math.floor(place.stayDuration/60)}시간${place.stayDuration%60>0?` ${place.stayDuration%60}분`:""}` : `${place.stayDuration}분`}
              </div>
            </>
          )}
        />
      )}

      {/* 결과 화면 */}
      {placeScreen === "result" && placeResult && (
        <div className="screen fade-in" style={{ paddingTop:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <button onClick={() => setPlaceScreen(placeAnswers.who ? "setup" : "home")} style={{
              background:"none", border:"none", fontSize:20, cursor:"pointer", padding:4, color:"var(--text-main)"
            }}>←</button>
            <div style={{ fontSize:20, fontWeight:800 }}>여기 가봐</div>
          </div>

          {/* context 안내 — 연결 이유 강조 */}
          {placeContext && (
            <div style={{
              background:"linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)",
              borderRadius:16, padding:"16px 18px", marginBottom:16,
              border:"1px solid rgba(102,126,234,0.25)"
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:22 }}>{placeContext.from === "whatToDo" ? (placeContext.activity?.emoji || "✨") : "🍽️"}</span>
                <span style={{ fontSize:15, fontWeight:800, color:"var(--text-main)" }}>
                  {placeContext.from === "whatToDo"
                    ? placeContext.activity?.name
                    : (placeContext.food?.name || "맛집")}
                </span>
              </div>
              <div style={{ fontSize:13, color:"var(--text-sub)", lineHeight:1.6 }}>
                {placeContext.from === "whatToDo" && placeContext.activity?.tags?.location?.[0] === "home"
                  ? "집에서 하면 최고인 거 알지! 전후로 잠깐 들르기 좋은 데 찾아봤어."
                  : placeContext.from === "whatToDo"
                  ? "이거 하기 전이나 후에 들르면 좋을 곳이야."
                  : "여기서 먹으면 맛있을 걸?"}
              </div>
            </div>
          )}

          {/* 메인 추천 */}
          <div style={{
            background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius:20, padding:"28px 22px", color:"#fff", marginBottom:16
          }}>
            <div style={{ fontSize:12, opacity:0.7, marginBottom:placeResult.connectionReason ? 6 : 8 }}>내가 찾은 곳 — {placeResult.reason}</div>
            {placeResult.connectionReason && (
              <div style={{
                fontSize:13, fontWeight:600, lineHeight:1.6, marginBottom:10,
                padding:"10px 14px", background:"rgba(255,255,255,0.12)", borderRadius:12,
                color:"rgba(255,255,255,0.95)"
              }}>
                💡 {placeResult.connectionReason}
              </div>
            )}
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
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(getMapQuery(placeResult.main.name))}`}
                target="_blank" rel="noopener noreferrer" style={{
                  flex:1, padding:"10px", borderRadius:10, background:"rgba(255,255,255,0.2)",
                  color:"#fff", fontSize:12, fontWeight:700, textAlign:"center",
                  textDecoration:"none", border:"1px solid rgba(255,255,255,0.3)"
                }}>📍 구글맵</a>
              <button onClick={() => openKakaoMap(getMapQuery(placeResult.main.name))} style={{
                  flex:1, padding:"10px", borderRadius:10, background:"rgba(255,255,255,0.2)",
                  color:"#fff", fontSize:12, fontWeight:700, textAlign:"center",
                  border:"1px solid rgba(255,255,255,0.3)", cursor:"pointer", fontFamily:"inherit"
                }}>🗺️ 카카오맵</button>
            </div>
          </div>

          {/* 대안 */}
          {placeResult.alternatives.length > 0 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--text-sub)", marginBottom:10 }}>이런 데도 괜찮아</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {placeResult.alternatives.map(p => (
                  <div key={p.id} style={{
                    background:"var(--bg-card)", borderRadius:14, padding:"16px 18px",
                    display:"flex", alignItems:"center", gap:12,
                  }}>
                    <div style={{ fontSize:28 }}>{p.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:3, color:"var(--text-main)" }}>{p.name}</div>
                      <div style={{ fontSize:12, color:"var(--text-sub)", lineHeight:1.4 }}>{p.summary}</div>
                      <div style={{ display:"flex", gap:4, marginTop:6, flexWrap:"wrap" }}>
                        {p.tags?.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            background:"var(--bg-main)", borderRadius:10,
                            padding:"2px 8px", fontSize:10, color:"var(--text-sub)"
                          }}>#{tag}</span>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:6, marginTop:8 }}>
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent(getMapQuery(p.name))}`}
                          target="_blank" rel="noopener noreferrer" style={{
                            padding:"4px 10px", borderRadius:8, background:"var(--bg-main)",
                            fontSize:10, fontWeight:700, color:"var(--text-sub)", textDecoration:"none"
                          }}>📍 구글맵</a>
                        <button onClick={() => openKakaoMap(getMapQuery(p.name))} style={{
                            padding:"4px 10px", borderRadius:8, background:"var(--bg-main)",
                            fontSize:10, fontWeight:700, color:"var(--text-sub)", border:"none",
                            cursor:"pointer", fontFamily:"inherit"
                          }}>🗺️ 카카오맵</button>
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
              background:"var(--text-main)", fontSize:14, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", color:"var(--bg-main)"
            }}>🔄 다른 데 없어?</button>
            <button onClick={() => { setPlaceScreen("setup"); }} style={{
              flex:1, padding:"14px", borderRadius:12, border:"1px solid var(--text-dim)",
              background:"var(--bg-card)", fontSize:14, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", color:"var(--text-main)"
            }}>⚙ 다시 골라볼래</button>
          </div>
          <button onClick={() => { setPlaceScreen("home"); setPlaceContext(null); setPlaceAnswers({ who:null, inOut:null, budget:null, mood:null }); }} style={{
            width:"100%", padding:"12px", background:"transparent", border:"none",
            fontSize:13, color:"var(--text-dim)", cursor:"pointer", fontFamily:"inherit"
          }}>
            🏠 처음으로
          </button>
        </div>
      )}
    </>
  );
}
