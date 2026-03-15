import React from "react";
import { VIBE_OPTIONS, BLACKLIST_OPTIONS } from './constants.js';

const chipStyle = (sel, accentBorder, accentBg) => ({
  padding: "10px 0",
  borderRadius: 12,
  border: sel ? `1.5px solid ${accentBorder}` : "1.5px solid var(--text-dim)",
  background: sel ? accentBg : "var(--bg-card)",
  color: sel ? "var(--text-main)" : "var(--text-sub)",
  fontSize: 13,
  fontWeight: sel ? 700 : 500,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  transition: "all 0.15s",
});

export default function OnboardingScreen({
  tempVibes, setTempVibes, tempBlacklist, setTempBlacklist,
  sodaKeys, setSodaKeys, sodaColorRef,
  onComplete,
}) {
  return (
    <div className="screen fade-in" style={{ paddingBottom:32 }}>
      <div style={{ marginBottom:24, paddingTop:8 }}>
        <div className="step-label">어 처음이네? 👋</div>
        <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.5px", lineHeight:1.3 }}>취향 2가지만 알려줘</div>
        <div style={{ fontSize:12, color:"var(--text-sub)", marginTop:4 }}>이거 알아야 제대로 추천해주지. 나중에 바꿔도 돼.</div>
      </div>

      {/* 좋아하는 느낌 */}
      <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"var(--text-main)" }}>
        이런 거 좋아해? <span style={{color:"var(--text-sub)",fontWeight:500,fontSize:11}}>(최대 5개)</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6, marginBottom:24 }}>
        {VIBE_OPTIONS.map(v => {
          const sel = tempVibes.includes(v.value);
          return (
            <button key={v.value}
              onClick={() => {
                setTempVibes(p => p.includes(v.value)
                  ? p.filter(x => x !== v.value)
                  : p.length >= 5 ? p : [...p, v.value]
                );
              }}
              style={chipStyle(sel, "var(--accent-friend)", "rgba(123,204,154,0.15)")}
            >
              <span style={{ fontSize: 15 }}>{v.emoji}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* 절대 안 하는 것 */}
      <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"var(--text-main)" }}>
        이건 진짜 싫어 <span style={{color:"var(--text-sub)",fontWeight:500,fontSize:11}}>(추천에서 빼줄게)</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6, marginBottom:24 }}>
        {BLACKLIST_OPTIONS.map(v => {
          const sel = tempBlacklist.includes(v.value);
          return (
            <button key={v.value}
              onClick={() => {
                setTempBlacklist(p => p.includes(v.value)
                  ? p.filter(x => x !== v.value)
                  : [...p, v.value]
                );
              }}
              style={chipStyle(sel, "var(--accent-date)", "rgba(204,123,139,0.15)")}
            >
              <span style={{ fontSize: 15 }}>{v.emoji}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      <button className="start-btn" onClick={() => onComplete(tempVibes, tempBlacklist)}>
        {(tempVibes.length + tempBlacklist.length) > 0 ? "좋아, 시작하자 →" : "귀찮아, 그냥 넘길래 →"}
      </button>
    </div>
  );
}
