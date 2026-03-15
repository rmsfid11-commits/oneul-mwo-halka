import React from "react";

const SITUATIONS = [
  {
    id: "alone",
    label: "혼자야",
    sub: "집에서 뒹굴? 나가볼까?",
    color: "#7B9ACC",
  },
  {
    id: "date",
    label: "데이트야",
    sub: "설레는 데이트 코스 짜줄게",
    color: "#CC7B8B",
  },
  {
    id: "friend",
    label: "친구랑",
    sub: "놀 거 없다고? 내가 찾아줄게",
    color: "#7BCC9A",
  },
  {
    id: "random",
    label: "몰라 일단",
    sub: "생각하기 귀찮지? 맡겨",
    color: "#CCAA7B",
  },
];

export default function SituationScreen({ onSelect }) {
  return (
    <div className="screen fade-in" style={{ paddingTop: 48 }}>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.8px", marginBottom: 6 }}>
        오늘 누구랑 있어?
      </div>
      <div style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 32, lineHeight: 1.5 }}>
        골라봐, 나머지는 내가 알아서 할게
      </div>

      <div className="stagger-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SITUATIONS.map(s => (
          <div
            key={s.id}
            className="situation-card"
            onClick={() => onSelect(s.id)}
          >
            <div className="situation-bar" style={{ background: s.color }} />
            <div>
              <div className="situation-label">{s.label}</div>
              <div className="situation-sub">{s.sub}</div>
            </div>
            <div className="situation-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
