import React from "react";
import { QUESTIONS } from './constants.js';

export default function SetupScreen({
  answers, setAnswers, expanded, setExpanded,
  canStart, missing,
  onStartTournament, // (isChallenge, bracketSize) => void
  onQuickPick, // () => void — 그냥 골라줘
  onResetOnboarding, // () => void — 취향 설정 초기화
}) {
  function selectOption(qid, val) {
    setAnswers(a => ({ ...a, [qid]: val }));
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

  return (
    <div className="screen fade-in">
      <div style={{ marginBottom:28, paddingTop:8 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px" }}>오늘 뭐하지? ✨</div>
          <button onClick={onResetOnboarding} style={{
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
                            {opt.subs.map(sub => {
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

      {!canStart && (
        <button className="start-btn" disabled>
          {`아직 ${missing.length}개 남았어`}
        </button>
      )}
      {canStart && (
        <>
          <div style={{ fontSize:13, fontWeight:700, color:"#aaa", textAlign:"center", marginTop:20, marginBottom:10 }}>취향 찾기</div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { size:4, label:"빠르게", sub:"2번이면 끝", emoji:"🚀" },
              { size:8, label:"적당히", sub:"7번 고르기", emoji:"⚡" },
              { size:16, label:"제대로", sub:"15번 풀코스", emoji:"🏆" },
            ].map(r => (
              <button key={r.size} onClick={() => onStartTournament(false, r.size)} style={{
                flex:1, padding:"14px 8px", borderRadius:14,
                border:"1.5px solid #E0DED8", background:"#fff",
                cursor:"pointer", fontFamily:"inherit",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              }}>
                <span style={{ fontSize:22 }}>{r.emoji}</span>
                <span style={{ fontSize:14, fontWeight:700, color:"#191919" }}>{r.label}</span>
                <span style={{ fontSize:11, color:"#aaa" }}>{r.sub}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {canStart && (
        <button onClick={onQuickPick} style={{
          width:"100%", marginTop:10, padding:"15px",
          background:"#fff", border:"1.5px solid #E0DED8",
          borderRadius:16, fontSize:15, fontWeight:700,
          color:"#555", cursor:"pointer", fontFamily:"inherit"
        }}>
          🎲 그냥 골라줘
        </button>
      )}
      {canStart && (
        <button onClick={() => onStartTournament(true, 8)} style={{
          width:"100%", marginTop:8, padding:"12px",
          background:"transparent", border:"none",
          fontSize:13, fontWeight:600,
          color:"#aaa", cursor:"pointer", fontFamily:"inherit"
        }}>
          ✦ 도전 모드 — 안 해본 것들로만
        </button>
      )}
    </div>
  );
}
