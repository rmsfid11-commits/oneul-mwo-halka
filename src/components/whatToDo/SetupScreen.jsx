import React, { useRef, useEffect, useCallback, useState } from "react";
import { QUESTIONS } from './constants.js';

// 시간 옵션 생성 (30분 ~ 48시간)
const HOUR_OPTIONS = [];
for (let h = 0.5; h <= 48; h += 0.5) {
  let label;
  if (h >= 24) {
    const days = Math.floor(h / 24);
    const rem = h % 24;
    label = `${days}박${rem > 0 ? ` ${rem % 1 === 0 ? rem : rem}시간` : ""}`;
  } else if (h < 1) {
    label = `${h * 60}분`;
  } else if (h % 1 === 0.5) {
    label = `${Math.floor(h)}시간 30분`;
  } else {
    label = `${h}시간`;
  }
  HOUR_OPTIONS.push({ value: h, label });
}

const ITEM_H = 48; // 각 아이템 높이
const VISIBLE = 5; // 보이는 아이템 수

function ScrollPicker({ value, onChange }) {
  const containerRef = useRef(null);
  const scrollingRef = useRef(false);
  const timerRef = useRef(null);

  const currentIdx = HOUR_OPTIONS.findIndex(o => o.value === value);
  const safeIdx = currentIdx >= 0 ? currentIdx : 3; // 기본 2시간

  // 스크롤 위치 → 인덱스
  const getIdxFromScroll = useCallback((scrollTop) => {
    return Math.round(scrollTop / ITEM_H);
  }, []);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = safeIdx * ITEM_H;
    }
  }, []);

  // 스크롤 이벤트
  const handleScroll = useCallback(() => {
    scrollingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const idx = getIdxFromScroll(el.scrollTop);
      const clamped = Math.max(0, Math.min(idx, HOUR_OPTIONS.length - 1));
      // 스냅
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      if (HOUR_OPTIONS[clamped]?.value !== value) {
        onChange(HOUR_OPTIONS[clamped].value);
      }
      scrollingRef.current = false;
    }, 80);
  }, [value, onChange, getIdxFromScroll]);

  // 패딩용 빈 아이템 (위아래 2개씩)
  const pad = Math.floor(VISIBLE / 2);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {/* 선택 영역 하이라이트 */}
      <div style={{
        position: "absolute",
        top: pad * ITEM_H,
        left: 0, right: 0,
        height: ITEM_H,
        background: "var(--bg-card-hover)",
        borderRadius: 12,
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* 위아래 페이드 */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: pad * ITEM_H,
        background: "linear-gradient(to bottom, var(--bg-card), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: pad * ITEM_H,
        background: "linear-gradient(to top, var(--bg-card), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />

      {/* 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: VISIBLE * ITEM_H,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          position: "relative",
          zIndex: 1,
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {/* 위 패딩 */}
        {Array.from({ length: pad }).map((_, i) => (
          <div key={`pad-top-${i}`} style={{ height: ITEM_H }} />
        ))}

        {/* 옵션들 */}
        {HOUR_OPTIONS.map((opt, i) => {
          const isSelected = opt.value === value;
          return (
            <div
              key={opt.value}
              style={{
                height: ITEM_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scrollSnapAlign: "center",
                fontSize: isSelected ? 22 : 16,
                fontWeight: isSelected ? 800 : 500,
                color: isSelected ? "var(--text-main)" : "var(--text-dim)",
                transition: "all 0.15s",
                cursor: "pointer",
              }}
              onClick={() => {
                const el = containerRef.current;
                if (el) {
                  el.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
                }
                onChange(opt.value);
              }}
            >
              {opt.label}
            </div>
          );
        })}

        {/* 아래 패딩 */}
        {Array.from({ length: pad }).map((_, i) => (
          <div key={`pad-bot-${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  );
}

export default function SetupScreen({
  answers, setAnswers, expanded, setExpanded,
  canStart, missing,
  onStartTournament,
  onQuickPick,
  onResetOnboarding,
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
            padding:"6px 12px", borderRadius:100, border:"1.5px solid var(--text-dim)",
            background:"var(--bg-card)", fontSize:11, fontWeight:700, color:"var(--text-sub)",
            cursor:"pointer", fontFamily:"inherit"
          }}>⚙ 취향 설정</button>
        </div>
        <div style={{ fontSize:14, color:"var(--text-sub)", marginTop:6 }}>지금 상태 알려주면 오늘 하루 짜줄게</div>
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
                <ScrollPicker
                  value={answers.hours}
                  onChange={(v) => setAnswers(a => ({ ...a, hours: v }))}
                />
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
                              <div style={{fontSize:12,color:"var(--text-sub)",padding:"8px 16px 4px",fontWeight:600,display:"flex",justifyContent:"space-between"}}>
                                <span>{opt.subLabel}</span>
                                {opt.maxSubs > 1 && <span style={{color:"var(--text-dim)"}}>최대 {opt.maxSubs}개</span>}
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
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text-sub)", textAlign:"center", marginTop:20, marginBottom:10 }}>취향 찾기</div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { size:4, label:"빠르게", sub:"2번이면 끝", emoji:"🚀" },
              { size:8, label:"적당히", sub:"7번 고르기", emoji:"⚡" },
              { size:16, label:"제대로", sub:"15번 풀코스", emoji:"🏆" },
            ].map(r => (
              <button key={r.size} onClick={() => onStartTournament(false, r.size)} style={{
                flex:1, padding:"14px 8px", borderRadius:14,
                border:"1.5px solid var(--text-dim)", background:"var(--bg-card)",
                cursor:"pointer", fontFamily:"inherit",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              }}>
                <span style={{ fontSize:22 }}>{r.emoji}</span>
                <span style={{ fontSize:14, fontWeight:700, color:"var(--text-main)" }}>{r.label}</span>
                <span style={{ fontSize:11, color:"var(--text-sub)" }}>{r.sub}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {canStart && (
        <button onClick={onQuickPick} style={{
          width:"100%", marginTop:10, padding:"15px",
          background:"var(--bg-card)", border:"1.5px solid var(--text-dim)",
          borderRadius:16, fontSize:15, fontWeight:700,
          color:"var(--text-sub)", cursor:"pointer", fontFamily:"inherit"
        }}>
          🎲 그냥 골라줘
        </button>
      )}
      {canStart && (
        <button onClick={() => onStartTournament(true, 8)} style={{
          width:"100%", marginTop:8, padding:"12px",
          background:"transparent", border:"none",
          fontSize:13, fontWeight:600,
          color:"var(--text-dim)", cursor:"pointer", fontFamily:"inherit"
        }}>
          ✦ 도전 모드 — 안 해본 것들로만
        </button>
      )}
    </div>
  );
}
