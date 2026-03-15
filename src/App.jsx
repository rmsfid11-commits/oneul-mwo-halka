import React, { useState, useRef, useCallback, useEffect } from "react";
import WhatToDo from './components/WhatToDo.jsx';
import WhatToEat from './components/WhatToEat.jsx';
import WhereToGo from './components/WhereToGo.jsx';
import SituationScreen from './components/shared/SituationScreen.jsx';

export default function VibeApp() {
  // ── 앱 진입 상태 ──
  const [appPhase, setAppPhase] = useState("splash"); // splash | situation | main
  const [situation, setSituation] = useState(null); // alone | date | friend | random

  // ── 공유 상태 ──
  const [tab, setTab] = useState("whatToDo");
  const [answers, setAnswers] = useState({
    need:"", alone:"", location:"", cost:"", hours:2,
    subs:{}, preferredVibes:[], blacklistGenres:[]
  });
  const [sodaKeys, setSodaKeys] = useState({});
  const sodaColorRef = useRef({});
  const [hideTabBar, setHideTabBar] = useState(false);
  const [pendingPlaceContext, setPendingPlaceContext] = useState(null);

  // ── 상황 선택 → answers 자동 채우기 ──
  function handleSituationSelect(sit) {
    setSituation(sit);

    // 상황별 answers 프리셋
    const presets = {
      alone: { alone: "혼자", subs: {} },
      date: { alone: "같이", subs: { alone: ["연인"] } },
      friend: { alone: "같이", subs: { alone: ["친구"] } },
      random: {},
    };

    const preset = presets[sit] || {};
    setAnswers(a => ({ ...a, ...preset, subs: { ...a.subs, ...preset.subs } }));
    setAppPhase("main");
  }

  // ── 뭐할까/뭐먹지 → 어디가지 연결 ──
  function goToPlaceFromContext(ctx) {
    const whoMap = { "혼자":"alone", "강아지랑":"alone" };
    let who = whoMap[answers.alone] || null;
    const togetherWith = answers.subs?.alone?.[0];
    if (togetherWith === "연인") who = "partner";
    else if (togetherWith === "가족") who = "family";
    else if (togetherWith === "친구" || answers.alone === "같이") who = "friend";

    const budgetMap = { "무료":"low", "조금":"mid", "상관없어":"high" };
    const inOutMap = { "home":"indoor", "out":"outdoor" };
    const needMoodMap = { "힐링":"chill", "멍때리기":"chill", "성취감":"active", "자극":"active" };

    const pa = {
      who,
      inOut: inOutMap[answers.location] || "both",
      budget: budgetMap[answers.cost] || "mid",
      mood: needMoodMap[answers.need] || "random",
    };

    // 집에 있을 거야 선택 시 넛지 플래그
    const stayHome = answers.location === "home";
    setPendingPlaceContext({ placeAnswers: pa, placeContext: ctx, stayHome });
    setTab("whereToGo");
  }

  const handleHideTabBar = useCallback((v) => setHideTabBar(v), []);
  const handleClearPendingContext = useCallback(() => setPendingPlaceContext(null), []);

  // ── 상황별 악센트 컬러 ──
  const accentColors = {
    alone: "#7B9ACC",
    date: "#CC7B8B",
    friend: "#7BCC9A",
    random: "#CCAA7B",
  };
  const accent = accentColors[situation] || accentColors.random;

  // ── 스플래시 (0.8초) ──
  useEffect(() => {
    if (appPhase === "splash") {
      const t = setTimeout(() => setAppPhase("situation"), 1200);
      return () => clearTimeout(t);
    }
  }, [appPhase]);

  if (appPhase === "splash") {
    return (
      <div style={{
        position:"fixed", inset:0, background:"var(--bg-main)",
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:999,
      }}>
        <div style={{
          fontSize:28, fontWeight:900, letterSpacing:"-1px",
          color:"var(--text-main)",
          animation:"fadeIn 0.3s ease-out",
        }}>
          오늘 뭐하지?
        </div>
      </div>
    );
  }

  // ── 상황 선택 ──
  if (appPhase === "situation") {
    return (
      <div style={{ minHeight:"100vh", fontFamily:"'Noto Sans KR', sans-serif" }}>
        <SituationScreen onSelect={handleSituationSelect} />
      </div>
    );
  }

  // ── 메인 ──
  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Noto Sans KR', sans-serif" }}>

      {tab === "whatToDo" && (
        <WhatToDo
          answers={answers}
          setAnswers={setAnswers}
          sodaKeys={sodaKeys}
          setSodaKeys={setSodaKeys}
          sodaColorRef={sodaColorRef}
          onHideTabBar={handleHideTabBar}
          goToPlaceFromContext={goToPlaceFromContext}
        />
      )}

      {tab === "whatToEat" && (
        <WhatToEat
          sodaKeys={sodaKeys}
          setSodaKeys={setSodaKeys}
          sodaColorRef={sodaColorRef}
          onHideTabBar={handleHideTabBar}
          goToPlaceFromContext={goToPlaceFromContext}
        />
      )}

      {tab === "whereToGo" && (
        <WhereToGo
          sodaKeys={sodaKeys}
          setSodaKeys={setSodaKeys}
          sodaColorRef={sodaColorRef}
          onHideTabBar={handleHideTabBar}
          pendingPlaceContext={pendingPlaceContext}
          onClearPendingContext={handleClearPendingContext}
        />
      )}

      {/* ── 하단 탭바 ── */}
      {!hideTabBar && (
        <div style={{
          position:"fixed", bottom:0, left:0, right:0,
          background:"var(--bg-card)", borderTop:"1px solid var(--text-dim)",
          display:"flex", justifyContent:"center", zIndex:50,
          padding:"0 0 env(safe-area-inset-bottom)"
        }}>
          <div style={{ display:"flex", maxWidth:480, width:"100%", justifyContent:"space-around" }}>
            {[
              { key:"whatToDo", label:"뭐 할까" },
              { key:"whatToEat", label:"뭐 먹지" },
              { key:"whereToGo", label:"어디 가지" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex:1, padding:"14px 0 12px", background:"transparent",
                border:"none", cursor:"pointer", fontFamily:"inherit",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                color: tab === t.key ? "var(--text-main)" : "var(--text-dim)",
                transition:"color 0.15s"
              }}>
                <span style={{ fontSize:12, fontWeight: tab === t.key ? 800 : 500 }}>{t.label}</span>
                {tab === t.key && (
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
