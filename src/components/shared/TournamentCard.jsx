import React from "react";

// 3탭(뭐할까/뭐먹지/어디가지) 공용 토너먼트 카드
// 소다 애니메이션 + 버블 + VS 디바이더 포함

const TBUBBLES = [
  {left:"10%",size:5,dur:3.0,delay:0.2},{left:"22%",size:8,dur:2.6,delay:0.7},
  {left:"35%",size:4,dur:3.4,delay:1.3},{left:"48%",size:9,dur:2.8,delay:0.5},
  {left:"62%",size:6,dur:3.2,delay:1.0},{left:"75%",size:4,dur:2.9,delay:1.6},
  {left:"85%",size:7,dur:3.1,delay:0.4},{left:"50%",size:5,dur:2.7,delay:1.8},
];

// 라운드 라벨 생성
export function getRoundLabel(bracketLength, current, total) {
  if (bracketLength === 16) return `16강 · ${current}/${total}`;
  if (bracketLength === 8) return `8강 · ${current}/${total}`;
  if (bracketLength === 4) return `4강 · ${current}/${total}`;
  if (bracketLength === 2) return "🏆 결승!";
  return `${current}/${total}`;
}

// 개별 카드 (한 쪽)
function CardSide({ item, side, isPicked, isOther, onClick, colors, sodaKey, renderInfo }) {
  return (
    <div
      className={`toss-card${isPicked ? " picking-"+side : ""}`}
      onClick={onClick}
      style={{
        opacity: isOther ? 0.4 : 1,
        transition: "opacity 0.3s ease, transform 0.25s",
        overflow: "hidden",
        position: "relative",
        animation: isPicked ? "shakeCan 0.55s ease" : "none",
      }}
    >
      {isPicked && (<>
        <div className="liquid" key={sodaKey} style={{
          position:"absolute", left:-4, right:-4, bottom:-50, top:-30,
          animation:"liquidRise 1.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards", zIndex:1
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:24, overflow:"hidden" }}>
            <svg style={{ width:"200%", height:24, display:"block", animation:"waveScroll 2s linear infinite" }}
              viewBox="0 0 200 24" preserveAspectRatio="none">
              <path d="M0,12 C25,2 50,22 75,12 C100,2 125,22 150,12 C175,2 200,22 200,12 L200,24 L0,24 Z" fill={colors[0]} />
            </svg>
          </div>
          <div style={{ position:"absolute", inset:0, top:18, background:`linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)` }} />
        </div>
        {TBUBBLES.map((b, i) => (
          <div key={`${sodaKey}-b${i}`} style={{
            position:"absolute", width:b.size, height:b.size, left:b.left,
            bottom:`${6+(i%6)*4}%`, borderRadius:"50%",
            background:"rgba(255,255,255,0.78)", zIndex:3,
            animation:`bubbleFloat ${b.dur}s ease-out ${b.delay}s infinite`,
            opacity:0, "--drift":`${((i%5)-2)*5}px`, pointerEvents:"none",
          }} />
        ))}
      </>)}
      {renderInfo(item)}
    </div>
  );
}

// 토너먼트 화면 전체
export default function TournamentCard({
  bracket, matchIdx, picking, colors, sodaKey,
  onPick, onBack, backLabel = "← 그만하기",
  renderInfo, // (item) => JSX — 카드 안에 표시할 내용
}) {
  const pair = bracket.slice(matchIdx, matchIdx + 2);
  const total = bracket.length / 2;
  const current = Math.floor(matchIdx / 2) + 1;

  if (pair.length < 2) return null;

  return (
    <div className="tournament-screen fade-in">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width:`${(current / total) * 100}%` }} />
      </div>
      <div className="match-label">{getRoundLabel(bracket.length, current, total)}</div>

      <div className="cards-wrap">
        {[["left", pair[0]], ["right", pair[1]]].map(([side, item], idx) => (
          <React.Fragment key={side}>
            {idx === 1 && <div className="vs-divider">VS</div>}
            <CardSide
              item={item}
              side={side}
              isPicked={picking === side}
              isOther={picking && picking !== side}
              onClick={() => onPick(item, side)}
              colors={colors}
              sodaKey={sodaKey}
              renderInfo={renderInfo}
            />
          </React.Fragment>
        ))}
      </div>

      <button style={{
        background:"transparent", border:"none", color:"#bbb", fontSize:13,
        cursor:"pointer", marginTop:24, width:"100%", fontFamily:"inherit"
      }} onClick={onBack}>
        {backLabel}
      </button>
    </div>
  );
}
