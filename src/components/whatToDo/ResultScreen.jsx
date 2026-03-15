import React, { useState } from "react";
import { FEEDBACK_REASONS } from './constants.js';
import { getLearnedVibes, clearHistory } from './matchEngine.js';
import { supabase } from '../../lib/supabase.js';

// "해봤어" 체크 — localStorage 헬퍼
function getDoneActivities() {
  try { return JSON.parse(localStorage.getItem("done_activities") || "[]"); }
  catch { return []; }
}
function markDone(actId) {
  const list = getDoneActivities();
  if (!list.includes(actId)) {
    list.push(actId);
    localStorage.setItem("done_activities", JSON.stringify(list));
  }
  return list;
}

const VIBE_LABEL = {
  고요함:"조용하고 고요한 것", 두근거림:"두근거리는 것", 땀흘리기:"땀 흘리는 것",
  감성충전:"감성 충전", 완성하는기쁨:"완성의 기쁨", 자연감성:"자연 속 활동",
  소소한사치:"소소한 사치", 지적자극:"머리 쓰는 활동", 혼자만의시간:"혼자만의 시간",
  새로운경험:"새로운 경험", 야간감성:"밤 감성", 도전:"도전적인 활동", 자유로움:"자유로운 활동",
};

export default function ResultScreen({
  champion, courses, selectedCourse, setSelectedCourse,
  mySchedule, setMySchedule, championPick,
  answers, tournamentHistory, showRunnerUps, setShowRunnerUps,
  champFlipped, setChampFlipped,
  onRebuildCourse, // (activity) => void
  onReset, // () => void
  goToPlaceFromContext,
}) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [doneActivities, setDoneActivities] = useState(getDoneActivities);

  const learnedVibes = getLearnedVibes();

  function handleMarkDone(actId) {
    const updated = markDone(actId);
    setDoneActivities([...updated]);
  }
  const isDone = (actId) => doneActivities.includes(actId);

  async function sendFeedback(reasonId) {
    if (!selectedCourse) return;
    const report = {
      reason: reasonId,
      course_title: selectedCourse.title,
      activities: mySchedule.map(a => ({ id:a.id, name:a.name, genre:a.genre, duration:a.duration||a.time })),
      total_minutes: mySchedule.reduce((s,a) => s + (a.duration||a.time), 0),
      user_answers: { need:answers.need, alone:answers.alone, location:answers.location, cost:answers.cost, hours:answers.hours },
    };
    try {
      await supabase.from("course_feedback").insert(report);
    } catch {
      const saved = JSON.parse(localStorage.getItem("course_feedback") || "[]");
      saved.push({ ...report, ts: new Date().toISOString() });
      localStorage.setItem("course_feedback", JSON.stringify(saved));
    }
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedbackOpen(false); }, 1500);
  }

  return (
    <div className="result-screen fade-in">

      {/* 해봤어 카운트 배지 */}
      {doneActivities.length > 0 && (
        <div style={{
          background:"linear-gradient(135deg, rgba(74,170,74,0.15) 0%, rgba(74,170,74,0.05) 100%)",
          borderRadius:14, padding:"10px 14px",
          marginBottom:12, fontSize:13, fontWeight:700,
          color:"#7BCC9A", textAlign:"center",
        }}>
          ✅ 지금까지 {doneActivities.length}개 해봤어!
        </div>
      )}

      {/* 패턴 학습 배지 */}
      {learnedVibes.length >= 2 && (
        <div style={{
          background:"var(--bg-card)", borderRadius:14, padding:"10px 14px",
          marginBottom:12, fontSize:12, color:"var(--text-sub)", lineHeight:1.6
        }}>
          📊 <b>너 이런 애야</b> — {learnedVibes.slice(0,3).map(v => VIBE_LABEL[v] || v).join(", ")} 좋아하잖아
        </div>
      )}

      {/* ── 코스 선택 모드 ── */}
      {!selectedCourse && courses.length > 0 && (
        <div style={{ marginBottom:20 }}>

          {/* 오늘의 픽 카드 */}
          {championPick && (
            <div style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              borderRadius: 20, padding: "20px 18px", marginBottom: 20, color: "#fff",
              animation: "fadeIn 0.4s ease-out",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginBottom: 12 }}>
                ✦ 오늘의 픽
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 44 }}>{championPick.activity.emoji}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>{championPick.activity.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                    {championPick.activity.duration || championPick.activity.time}분
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.95)",
                lineHeight: 1.5, marginBottom: 10,
                borderLeft: "3px solid rgba(255,255,255,0.4)", paddingLeft: 12,
              }}>
                "{championPick.hook}"
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 14 }}>
                {championPick.reason}
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <div style={{
                  flex:1, display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 12px", background: "rgba(255,255,255,0.08)",
                  borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.5)",
                }}>
                  <span>↓</span>
                  <span>이거 넣어서 코스 짰어, 아래 봐봐</span>
                </div>
                {isDone(championPick.activity.id) ? (
                  <div style={{
                    padding:"8px 14px", borderRadius:10, fontSize:12, fontWeight:700,
                    background:"rgba(74,170,74,0.15)", color:"#7BCC9A",
                    display:"flex", alignItems:"center", flexShrink:0,
                  }}>✅ 해본 활동</div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); handleMarkDone(championPick.activity.id); }} style={{
                    padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)",
                    background:"rgba(255,255,255,0.08)", fontSize:12, fontWeight:700,
                    color:"rgba(255,255,255,0.7)", cursor:"pointer", fontFamily:"inherit",
                    flexShrink:0, transition:"all 0.2s",
                  }}>✅ 해봤어!</button>
                )}
              </div>
            </div>
          )}

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.5px" }}>이렇게 보내는 거 어때?</div>
            <div style={{ fontSize:13, color:"var(--text-sub)", marginTop:6 }}>
              {champion.emoji} {champion.name} 좋아한다며? 코스 {courses.length}개 짜왔어
            </div>
          </div>

          {courses.map((course, i) => (
            <div key={i} onClick={() => {
              setSelectedCourse(course);
              setMySchedule(course.activities);
              setFeedbackOpen(false); setFeedbackSent(false);
            }} style={{
              background: i === 0 ? "var(--bg-card-hover)" : "var(--bg-card)",
              color: "var(--text-main)",
              borderRadius:20, padding:"20px 18px", marginBottom:12,
              cursor:"pointer", transition:"all 0.2s",
              border: i === 0 ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid var(--text-dim)"
            }}>
              {i === 0 && (
                <div style={{ fontSize:10, fontWeight:700, color:"var(--text-dim)", marginBottom:8, letterSpacing:1 }}>
                  BEST MATCH
                </div>
              )}
              <div style={{ fontSize:16, fontWeight:800, marginBottom:10 }}>{course.title}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                {course.activities.map((act, j) => (
                  <div key={act.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:20 }}>{act.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{act.name}</span>
                    {j < course.activities.length - 1 && (
                      <span style={{ color:"var(--text-dim)", margin:"0 2px" }}>→</span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:12, color:"var(--text-sub)", lineHeight:1.5 }}>
                  {course.reason}
                </div>
                <div style={{
                  fontSize:11, fontWeight:700, flexShrink:0, marginLeft:12,
                  padding:"4px 10px", borderRadius:100,
                  background:"var(--bg-main)", color:"var(--text-sub)"
                }}>
                  {course.totalMinutes}분
                </div>
              </div>
            </div>
          ))}

          {/* 패자부활전 */}
          {!showRunnerUps && tournamentHistory.length > 0 && (
            <button onClick={() => setShowRunnerUps(true)} style={{
              width:"100%", padding:"14px", marginTop:4,
              background:"var(--bg-card)", border:"1.5px dashed var(--text-dim)",
              borderRadius:14, fontSize:14, fontWeight:700,
              color:"var(--text-sub)", cursor:"pointer", fontFamily:"inherit",
            }}>
              🔄 음... 이거 말고 딴 거 없어?
            </button>
          )}
          {showRunnerUps && (() => {
            const losers = tournamentHistory
              .filter(act => act.id !== champion.id)
              .reduce((acc, act) => {
                if (!acc.find(a => a.id === act.id)) acc.push(act);
                return acc;
              }, [])
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .slice(0, 4);
            return (
              <div style={{ marginTop:8, animation:"fadeIn 0.3s ease-out" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text-sub)", marginBottom:10 }}>
                  아깝게 진 애들이야, 한 번 봐봐
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                  {losers.map(act => (
                    <div key={act.id} onClick={() => onRebuildCourse(act)} style={{
                      background:"var(--bg-card)", borderRadius:16, padding:"18px 14px",
                      textAlign:"center", cursor:"pointer",
                      border:"1.5px solid var(--text-dim)", transition:"all 0.2s"
                    }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>{act.emoji}</div>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:4, color:"var(--text-main)" }}>{act.name}</div>
                      <div style={{ fontSize:11, color:"var(--text-sub)" }}>{act.time}분</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowRunnerUps(false)} style={{
                  width:"100%", marginTop:10, padding:"10px",
                  background:"transparent", border:"none",
                  fontSize:12, color:"var(--text-sub)", cursor:"pointer", fontFamily:"inherit"
                }}>닫기</button>
              </div>
            );
          })()}
        </div>
      )}

      {/* 코스 없을 때 fallback (챔피언 카드) */}
      {!selectedCourse && courses.length === 0 && (
        <div style={{ marginBottom:12 }}>
        <div style={{ perspective:"800px", height:200 }} onClick={() => setChampFlipped(f => !f)}>
          <div style={{
            width:"100%", height:"100%", position:"relative",
            transformStyle:"preserve-3d",
            transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: champFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            cursor:"pointer"
          }}>
            <div style={{
              position:"absolute", width:"100%", height:"100%",
              backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
              background:"var(--bg-card)", borderRadius:28, padding:"28px 24px",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8
            }}>
              <div style={{fontSize:52}}>{champion.emoji}</div>
              <div style={{fontSize:22, fontWeight:900, color:"var(--text-main)"}}>{champion.name}</div>
              <span className="champ-badge">{champion.time}분</span>
            </div>
            <div style={{
              position:"absolute", width:"100%", height:"100%",
              backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
              transform:"rotateY(180deg)",
              background:"var(--bg-card)", color:"var(--text-main)", borderRadius:28, padding:"28px 24px",
              display:"flex", flexDirection:"column", justifyContent:"center", gap:14
            }}>
              <div style={{fontSize:28}}>{champion.emoji}</div>
              <div style={{fontSize:15, fontWeight:700, lineHeight:1.6}}>{champion.hint}</div>
              <div style={{fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6}}>💡 {champion.tip}</div>
            </div>
          </div>
        </div>
        {isDone(champion.id) ? (
          <div style={{
            marginTop:10, textAlign:"center", padding:"10px",
            background:"rgba(74,170,74,0.15)", borderRadius:12,
            fontSize:13, fontWeight:700, color:"#7BCC9A",
          }}>✅ 해본 활동</div>
        ) : (
          <button onClick={() => handleMarkDone(champion.id)} style={{
            width:"100%", marginTop:10, padding:"12px",
            background:"var(--bg-card)", border:"1.5px solid var(--text-dim)",
            borderRadius:12, fontSize:14, fontWeight:700,
            color:"var(--text-sub)", cursor:"pointer", fontFamily:"inherit",
            transition:"all 0.2s",
          }}>✅ 해봤어!</button>
        )}
        </div>
      )}

      {/* ── 코스 선택 후: 일정 상세 ── */}
      {selectedCourse && (
        <div style={{ marginBottom:20 }}>
          <div style={{ marginBottom:16, cursor:"pointer" }} onClick={() => { setSelectedCourse(null); setMySchedule([]); }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:14, color:"var(--text-sub)" }}>←</span>
              <div style={{ fontSize:20, fontWeight:900, letterSpacing:"-0.5px" }}>{selectedCourse.title}</div>
            </div>
            <div style={{ fontSize:13, color:"var(--text-sub)", marginTop:4 }}>{selectedCourse.reason}</div>
          </div>

          {mySchedule.map((act, i) => (
            <div key={act.id} style={{ marginBottom: i < mySchedule.length - 1 ? 0 : 12 }}>
              <div className="schedule-item" style={{ position:"relative" }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  background: i === 0 ? "var(--text-main)" : "var(--bg-main)",
                  color: i === 0 ? "var(--bg-main)" : "var(--text-sub)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:800, fontSize:12, flexShrink:0
                }}>{i + 1}</div>
                <div className="s-emoji">{act.emoji}</div>
                <div style={{ flex:1 }}>
                  <div className="s-name" style={{ marginBottom:2 }}>{act.name}</div>
                  <div style={{ fontSize:11, color:"var(--text-sub)" }}>{act.hint}</div>
                </div>
                <div className="s-time">{act.duration || act.time}분</div>
                {isDone(act.id) ? (
                  <div style={{
                    fontSize:10, fontWeight:700, color:"#7BCC9A",
                    padding:"4px 8px", borderRadius:8,
                    background:"rgba(74,170,74,0.15)", flexShrink:0,
                  }}>✅</div>
                ) : (
                  <button onClick={() => handleMarkDone(act.id)} style={{
                    fontSize:10, fontWeight:700, color:"var(--text-sub)",
                    padding:"4px 8px", borderRadius:8, border:"1px solid var(--text-dim)",
                    background:"var(--bg-card)", cursor:"pointer", fontFamily:"inherit",
                    flexShrink:0, transition:"all 0.2s",
                  }}>해봤어</button>
                )}
              </div>
              {i < mySchedule.length - 1 && (
                <div style={{ display:"flex", justifyContent:"center", padding:"4px 0" }}>
                  <div style={{ width:1, height:20, background:"var(--text-dim)" }} />
                </div>
              )}
            </div>
          ))}

          <div style={{
            textAlign:"center", padding:"12px", fontSize:13, color:"var(--text-sub)",
            background:"var(--bg-main)", borderRadius:12
          }}>
            총 {mySchedule.reduce((s, a) => s + (a.duration || a.time), 0)}분 코스
          </div>

          {/* 피드백 */}
          {!feedbackOpen && !feedbackSent && (
            <button onClick={() => setFeedbackOpen(true)} style={{
              width:"100%", marginTop:10, padding:"10px", background:"none",
              border:"1px dashed var(--text-dim)", borderRadius:10, fontSize:13,
              color:"var(--text-sub)", cursor:"pointer", fontFamily:"inherit"
            }}>
              👎 솔직히 이 코스 좀 별로인데
            </button>
          )}
          {feedbackOpen && !feedbackSent && (
            <div style={{ marginTop:10, background:"var(--bg-card)", borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text-sub)", marginBottom:10 }}>뭐가 마음에 안 들어?</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {FEEDBACK_REASONS.map(r => (
                  <button key={r.id} onClick={() => sendFeedback(r.id)} style={{
                    padding:"8px 14px", borderRadius:20, border:"1px solid var(--text-dim)",
                    background:"var(--bg-card-hover)", fontSize:13, cursor:"pointer", fontFamily:"inherit", color:"var(--text-main)"
                  }}>
                    {r.emoji} {r.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setFeedbackOpen(false)} style={{
                marginTop:8, background:"none", border:"none", fontSize:12,
                color:"var(--text-sub)", cursor:"pointer", fontFamily:"inherit"
              }}>취소</button>
            </div>
          )}
          {feedbackSent && (
            <div style={{
              marginTop:10, textAlign:"center", padding:"12px",
              background:"rgba(74,170,74,0.15)", borderRadius:10, fontSize:13, color:"#7BCC9A"
            }}>
              알겠어! 다음엔 더 잘 해볼게
            </div>
          )}
        </div>
      )}

      {/* 하단 버튼 */}
      <div style={{ padding:"12px 0 24px", marginTop:8 }}>
        {selectedCourse && courses.length > 0 && (
          <button type="button" onClick={() => { setSelectedCourse(null); setMySchedule([]); }} style={{
            width:"100%", padding:"14px", background:"var(--bg-card)",
            border:"1.5px solid var(--text-dim)", borderRadius:14,
            fontSize:14, fontWeight:700, cursor:"pointer",
            fontFamily:"inherit", color:"var(--text-sub)", marginBottom:8
          }}>
            ← 다른 코스 보기
          </button>
        )}
        <button type="button" onClick={() => goToPlaceFromContext({ from:"whatToDo", activity: champion })} style={{
          width:"100%", padding:"15px", marginBottom:8,
          background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border:"none", borderRadius:14, fontSize:15, fontWeight:700,
          cursor:"pointer", fontFamily:"inherit", color:"#fff"
        }}>📍 이거 어디서 하지?</button>

        <button type="button" className="start-btn" style={{ marginTop:0 }} onClick={onReset}>처음부터 다시 할래</button>
        <button type="button" onClick={() => { clearHistory(); alert("싹 다 지웠어! 이제 새 출발이야."); }} style={{
          width:"100%", marginTop:8, padding:"10px",
          background:"transparent", border:"none",
          fontSize:12, color:"var(--text-sub)", cursor:"pointer", fontFamily:"inherit"
        }}>↺ 히스토리 초기화 (처음부터 다시)</button>
      </div>
    </div>
  );
}
