import React from "react";
import { VIBE_OPTIONS, BLACKLIST_OPTIONS } from './constants.js';

export default function OnboardingScreen({
  tempVibes, setTempVibes, tempBlacklist, setTempBlacklist,
  sodaKeys, setSodaKeys, sodaColorRef,
  onComplete,
}) {
  return (
    <div className="screen fade-in" style={{ paddingBottom:32 }}>
      <div style={{ marginBottom:24, paddingTop:8 }}>
        <div className="step-label">처음 오셨군요 👋</div>
        <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.5px", lineHeight:1.3 }}>취향 2가지만 알려줘</div>
        <div style={{ fontSize:12, color:"var(--text-sub)", marginTop:4 }}>더 정확한 추천을 위해. 나중에 바꿀 수 있어.</div>
      </div>

      {/* 좋아하는 느낌 */}
      <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"var(--text-main)" }}>
        좋아하는 느낌 <span style={{color:"var(--text-sub)",fontWeight:500,fontSize:11}}>(최대 5개)</span>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:28 }}>
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
              style={{
                padding: "8px 14px",
                borderRadius: 100,
                border: sel ? "1.5px solid var(--accent-friend)" : "1.5px solid var(--text-dim)",
                background: sel ? "rgba(123,204,154,0.15)" : "var(--bg-card)",
                color: sel ? "var(--text-main)" : "var(--text-sub)",
                fontSize: 13,
                fontWeight: sel ? 700 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 15 }}>{v.emoji}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* 절대 안 하는 것 */}
      <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"var(--text-main)" }}>
        절대 안 하는 것 <span style={{color:"var(--text-sub)",fontWeight:500,fontSize:11}}>(추천에서 제외)</span>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:28 }}>
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
              style={{
                padding: "8px 14px",
                borderRadius: 100,
                border: sel ? "1.5px solid var(--accent-date)" : "1.5px solid var(--text-dim)",
                background: sel ? "rgba(204,123,139,0.15)" : "var(--bg-card)",
                color: sel ? "var(--text-main)" : "var(--text-sub)",
                fontSize: 13,
                fontWeight: sel ? 700 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 15 }}>{v.emoji}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      <button className="start-btn" onClick={() => onComplete(tempVibes, tempBlacklist)}>
        {(tempVibes.length + tempBlacklist.length) > 0 ? "완료 → 시작하기" : "그냥 넘어갈게 →"}
      </button>
    </div>
  );
}
