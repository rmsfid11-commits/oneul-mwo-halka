import React from "react";
import { VIBE_OPTIONS, BLACKLIST_OPTIONS, SODA_COLORS, RED_COLORS, BUBBLES } from './constants.js';

export default function OnboardingScreen({
  tempVibes, setTempVibes, tempBlacklist, setTempBlacklist,
  sodaKeys, setSodaKeys, sodaColorRef,
  onComplete, // (vibes, blacklist) => void
}) {
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
          const sk = sodaKeys[v.value] || 0;
          const colors = sodaColorRef.current[v.value] || SODA_COLORS[0];
          return (
            <div key={v.value}
              className={`soda-card${sel ? " sel" : ""}`}
              onClick={() => {
                if (!sel) {
                  if (tempVibes.length >= 5) return;
                  sodaColorRef.current[v.value] = SODA_COLORS[Math.floor(Math.random() * SODA_COLORS.length)];
                  setSodaKeys(p => ({ ...p, [v.value]: (p[v.value] || 0) + 1 }));
                }
                setTempVibes(p => p.includes(v.value) ? p.filter(x=>x!==v.value) : p.length >= 5 ? p : [...p, v.value]);
              }}
              style={{ borderColor: sel ? colors[1] : undefined, fontFamily:"inherit" }}
            >
              {sel && (<>
                <div className="liquid" key={sk}>
                  <div className="wave-wrap">
                    <svg className="wave-svg" viewBox="0 0 200 24" preserveAspectRatio="none">
                      <path d="M0,12 C25,2 50,22 75,12 C100,2 125,22 150,12 C175,2 200,22 200,12 L200,24 L0,24 Z" fill={colors[0]} />
                    </svg>
                  </div>
                  <div className="liquid-color" style={{ background:`linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)` }} />
                </div>
                {BUBBLES.map((b, i) => (
                  <div key={`${sk}-b${i}`} style={{
                    position:"absolute", width:b.size, height:b.size, left:b.left,
                    bottom:`${6+(i%6)*3}%`, borderRadius:"50%",
                    background:"rgba(255,255,255,0.78)", zIndex:3,
                    animation:`bubbleFloat ${b.dur}s ease-out ${b.delay}s infinite`,
                    opacity:0, "--drift":`${((i%5)-2)*5}px`, pointerEvents:"none",
                  }} />
                ))}
              </>)}
              <div className="card-content">
                <span style={{fontSize:20}}>{v.emoji}</span>
                <span className="card-label">{v.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"#333" }}>
        절대 안 하는 것 <span style={{color:"#aaa",fontWeight:500,fontSize:11}}>(추천에서 제외)</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:28 }}>
        {BLACKLIST_OPTIONS.map(v => {
          const sel = tempBlacklist.includes(v.value);
          const bk = `bl-${v.value}`;
          const sk = sodaKeys[bk] || 0;
          const colors = sodaColorRef.current[bk] || RED_COLORS[0];
          return (
            <div key={v.value}
              className={`soda-card${sel ? " sel sel-red" : ""}`}
              onClick={() => {
                if (!sel) {
                  sodaColorRef.current[bk] = RED_COLORS[Math.floor(Math.random() * RED_COLORS.length)];
                  setSodaKeys(p => ({ ...p, [bk]: (p[bk] || 0) + 1 }));
                }
                setTempBlacklist(p => p.includes(v.value) ? p.filter(x=>x!==v.value) : [...p, v.value]);
              }}
              style={{ borderColor: sel ? colors[1] : undefined, fontFamily:"inherit" }}
            >
              {sel && (<>
                <div className="liquid" key={sk}>
                  <div className="wave-wrap">
                    <svg className="wave-svg" viewBox="0 0 200 24" preserveAspectRatio="none">
                      <path d="M0,12 C25,2 50,22 75,12 C100,2 125,22 150,12 C175,2 200,22 200,12 L200,24 L0,24 Z" fill={colors[0]} />
                    </svg>
                  </div>
                  <div className="liquid-color" style={{ background:`linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)` }} />
                </div>
                {BUBBLES.map((b, i) => (
                  <div key={`${sk}-b${i}`} style={{
                    position:"absolute", width:b.size, height:b.size, left:b.left,
                    bottom:`${6+(i%6)*3}%`, borderRadius:"50%",
                    background:"rgba(255,255,255,0.78)", zIndex:3,
                    animation:`bubbleFloat ${b.dur}s ease-out ${b.delay}s infinite`,
                    opacity:0, "--drift":`${((i%5)-2)*5}px`, pointerEvents:"none",
                  }} />
                ))}
              </>)}
              <div className="card-content">
                <span style={{fontSize:20}}>{v.emoji}</span>
                <span className="card-label">{v.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button className="start-btn" onClick={() => onComplete(tempVibes, tempBlacklist)}>
        {(tempVibes.length + tempBlacklist.length) > 0 ? "완료 → 시작하기 🚀" : "그냥 넘어갈게 →"}
      </button>
    </div>
  );
}
