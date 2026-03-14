import React, { useState, useRef, useCallback } from "react";
import WhatToDo from './components/WhatToDo.jsx';
import WhatToEat from './components/WhatToEat.jsx';
import WhereToGo from './components/WhereToGo.jsx';

export default function VibeApp() {
  // ── 공유 상태 ──
  const [tab, setTab] = useState("whatToDo"); // whatToDo | whatToEat | whereToGo
  const [answers, setAnswers] = useState({
    need:"", alone:"", location:"", cost:"", hours:2,
    subs:{}, preferredVibes:[], blacklistGenres:[]
  });
  const [sodaKeys, setSodaKeys] = useState({});
  const sodaColorRef = useRef({});
  const [hideTabBar, setHideTabBar] = useState(false);
  const [pendingPlaceContext, setPendingPlaceContext] = useState(null);

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

    setPendingPlaceContext({ placeAnswers: pa, placeContext: ctx });
    setTab("whereToGo");
  }

  const handleHideTabBar = useCallback((v) => setHideTabBar(v), []);
  const handleClearPendingContext = useCallback(() => setPendingPlaceContext(null), []);

  return (
    <div style={{ minHeight:"100vh", background:"#F5F4F0", fontFamily:"'Noto Sans KR', sans-serif", color:"#191919" }}>

      {/* ── 뭐 할까 ── */}
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

      {/* ── 뭐 먹지 ── */}
      {tab === "whatToEat" && (
        <WhatToEat
          sodaKeys={sodaKeys}
          setSodaKeys={setSodaKeys}
          sodaColorRef={sodaColorRef}
          onHideTabBar={handleHideTabBar}
          goToPlaceFromContext={goToPlaceFromContext}
        />
      )}

      {/* ── 어디 가지 ── */}
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
