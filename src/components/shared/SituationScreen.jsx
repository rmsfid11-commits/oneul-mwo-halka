import React from "react";

const SITUATIONS = [
  {
    id: "alone",
    label: "혼자야",
    sub: "쉬는 날 뭐하지?",
    color: "#7B9ACC",
  },
  {
    id: "date",
    label: "데이트야",
    sub: "오늘 어디 갈까?",
    color: "#CC7B8B",
  },
  {
    id: "friend",
    label: "친구랑",
    sub: "같이 뭐하지?",
    color: "#7BCC9A",
  },
  {
    id: "random",
    label: "몰라 일단",
    sub: "아무거나 골라줘요",
    color: "#CCAA7B",
  },
];

export default function SituationScreen({ onSelect }) {
  return (
    <div className="screen fade-in" style={{ paddingTop: 48 }}>
      <div className="step-label">STEP 01</div>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.8px", marginBottom: 6 }}>
        오늘 누구랑 있어요?
      </div>
      <div style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 32, lineHeight: 1.5 }}>
        기분만 알려주면, 나머지는 알아서 짜줄게요
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
