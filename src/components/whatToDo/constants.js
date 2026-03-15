// ─── 스타일 상수 ────────────────────────────────────────────
export const S = {
  screen: { maxWidth:480, margin:"0 auto", padding:"24px 20px 80px" },
  sectionTag: { display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:"1.5px", color:"#888", textTransform:"uppercase", marginBottom:6 },
  qCard: { background:"#fff", borderRadius:20, padding:20, marginBottom:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  qLabel: { fontSize:17, fontWeight:700, marginBottom:14, color:"#191919" },
  optRow: { display:"flex", flexDirection:"column", gap:8 },
  optBtn: (selected) => ({ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderRadius:14, border: selected ? "1.5px solid #191919" : "1.5px solid #ECEAE4", background: selected ? "#191919" : "#FAFAF8", cursor:"pointer", transition:"all 0.18s", fontFamily:"inherit", width:"100%" }),
  optLabel: (selected) => ({ fontSize:15, fontWeight:500, color: selected ? "#fff" : "#191919" }),
  startBtn: (disabled) => ({ width:"100%", padding:17, background: disabled ? "#D0CEC8" : "#191919", color: disabled ? "#999" : "#fff", border:"none", borderRadius:16, fontSize:16, fontWeight:800, cursor: disabled ? "default" : "pointer", fontFamily:"inherit", marginTop:24 }),
};

// ─── 질문 구조 ────────────────────────────────────────────
export const QUESTIONS = [
  {
    id: "need", section: "지금 상태", label: "지금 기분이 어때?",
    options: [
      { value:"힐링", label:"🌿 지쳐서 쉬고 싶어", subLabel:"어떻게 쉬고 싶어?", maxSubs:2, subs:[
        { value:"고요함", label:"조용히 아무것도 안 하고 싶어" },
        { value:"따뜻함", label:"따뜻하거나 감각적인 게 필요해" },
        { value:"감성충전", label:"감성적인 걸 보거나 듣고 싶어" },
        { value:"몸회복", label:"몸이 피곤해서 회복이 필요해" },
        { value:"정신정리", label:"생각을 정리하고 싶어" },
      ]},
      { value:"성취감", label:"🏆 뭔가 해내고 싶어", subLabel:"어떤 성취?", maxSubs:2, subs:[
        { value:"정리정돈", label:"집이나 물건을 정리하고 싶어" },
        { value:"완성하는기쁨", label:"뭔가 만들거나 완성하고 싶어" },
        { value:"지적자극", label:"배우거나 성장하는 느낌" },
        { value:"뿌듯함", label:"땀 흘리고 뿌듯한 느낌" },
      ]},
      { value:"자극", label:"⚡ 재미나 자극이 필요해", subLabel:"어떤 자극?", maxSubs:2, subs:[
        { value:"웃음", label:"그냥 웃고 싶어" },
        { value:"두근거림", label:"두근거리거나 짜릿한 게 필요해" },
        { value:"새로운경험", label:"새로운 걸 경험해보고 싶어" },
        { value:"도전", label:"뭔가에 도전하고 싶어" },
      ]},
      { value:"멍때리기", label:"😶 아무것도 하기 싫어", subLabel:"어느 정도?", maxSubs:1, subs:[
        { value:"수동적소비", label:"재밌는 거 보여주면 봄, 고르기는 싫어" },
        { value:"아무생각없이", label:"그냥 틀어만 놓고 싶어" },
        { value:"자연감성", label:"자연 속에서 멍때리고 싶어" },
      ]},
    ]
  },
  {
    id: "alone", section: "환경", label: "오늘 사람이 필요해?",
    options: [
      { value:"혼자", label:"🙋 혼자", subLabel:"어떤 혼자?", maxSubs:2, subs:[
        { value:"혼자만의시간", label:"완전 나만의 시간" },
        { value:"익명의공간", label:"카페 같은 익명 공간은 괜찮아" },
        { value:"기다리는맛", label:"느긋하게 기다리는 시간이 좋아" },
      ]},
      { value:"강아지랑", label:"🐕 강아지랑만", subLabel:"", maxSubs:0, subs:[] },
      { value:"같이", label:"👥 누군가랑", subLabel:"누구랑?", maxSubs:1, subs:[
        { value:"친구", label:"👯 친한 친구" },
        { value:"연인", label:"💑 연인" },
        { value:"가족", label:"👨‍👩‍👧 가족" },
        { value:"동료", label:"🤝 동료 / 지인" },
      ]},
    ]
  },
  {
    id: "location", section: "환경", label: "밖에 나갈 수 있어?",
    options: [
      { value:"home", label:"🏠 집에 있을 거야", subLabel:"", maxSubs:0, subs:[] },
      { value:"out", label:"🚶 나갈 수 있어", subLabel:"얼마나?", maxSubs:1, subs:[
        { value:"동네", label:"동네 근처만" },
        { value:"드라이브", label:"차 타고 어디든" },
        { value:"자연", label:"자연 / 바다 / 산까지" },
      ]},
    ]
  },
  {
    id: "cost", section: "환경", label: "오늘 돈 써도 돼?",
    options: [
      { value:"무료", label:"🆓 0원으로", subLabel:"", maxSubs:0, subs:[] },
      { value:"조금", label:"💸 조금은", subLabel:"", maxSubs:0, subs:[] },
      { value:"상관없어", label:"💳 상관없어", subLabel:"", maxSubs:0, subs:[] },
    ]
  },
  {
    id: "hours", section: "시간", label: "얼마나 있어?", type: "slider",
    options: []
  },
];

// ─── 계절 필터 ────────────────────────────────────────────
export const SEASONAL_ACTIVITIES = {
  150: [12, 1, 2],     // 눈 오는 날 산책 → 겨울
  74: [5, 6, 7, 8, 9], // 스노클링 → 여름
  78: [5, 6, 7, 8, 9], // 수상 스키 / 웨이크보드 → 여름
  79: [5, 6, 7, 8, 9], // 래프팅 → 여름
};

// ─── 피드백 사유 ────────────────────────────────────────────
export const FEEDBACK_REASONS = [
  { id:"combo", emoji:"🔀", label:"조합이 이상해" },
  { id:"time", emoji:"⏰", label:"시간이 안 맞아" },
  { id:"flow", emoji:"🏠", label:"동선이 비현실적" },
  { id:"boring", emoji:"😴", label:"재미없어 보여" },
  { id:"other", emoji:"🤔", label:"기타" },
];

// ─── 온보딩 옵션 ────────────────────────────────────────────
export const VIBE_OPTIONS = [
  { value:"고요함",        emoji:"🤫", label:"고요하게" },
  { value:"두근거림",      emoji:"💓", label:"두근두근" },
  { value:"땀흘리기",      emoji:"💪", label:"땀 흘리기" },
  { value:"감성충전",      emoji:"🎨", label:"감성 충전" },
  { value:"완성하는기쁨",  emoji:"✅", label:"완성의 기쁨" },
  { value:"자연감성",      emoji:"🌿", label:"자연 속에서" },
  { value:"소소한사치",    emoji:"✨", label:"소소한 사치" },
  { value:"지적자극",      emoji:"🧠", label:"머리 쓰기" },
  { value:"같이하면더좋은",emoji:"👥", label:"누군가랑" },
  { value:"혼자만의시간",  emoji:"🙋", label:"혼자만의 시간" },
  { value:"새로운경험",    emoji:"🗺️", label:"새로운 경험" },
  { value:"아무생각없이",  emoji:"😶", label:"멍때리기" },
  { value:"야간감성",      emoji:"🌙", label:"밤 감성" },
  { value:"기다리는맛",    emoji:"⏳", label:"기다리는 맛" },
  { value:"도전",          emoji:"🔥", label:"도전" },
  { value:"자유로움",      emoji:"🪁", label:"자유롭게" },
];

export const BLACKLIST_OPTIONS = [
  { value:"fishing",  emoji:"🎣", label:"낚시" },
  { value:"watersport",emoji:"🏄", label:"수상스포츠" },
  { value:"mountain", emoji:"⛰️", label:"등산" },
  { value:"sport",    emoji:"⚽", label:"팀스포츠" },
  { value:"camp",     emoji:"⛺", label:"캠핑" },
  { value:"social",   emoji:"🎤", label:"노래방 / 술" },
  { value:"craft",    emoji:"🏺", label:"공방" },
  { value:"beauty",   emoji:"💅", label:"뷰티" },
  { value:"game",     emoji:"🎮", label:"게임" },
  { value:"cooking",  emoji:"🍳", label:"요리" },
  { value:"fitness",  emoji:"🏋️", label:"헬스 / 홈트" },
  { value:"learn",    emoji:"📚", label:"강의 / 공부" },
  { value:"digital",  emoji:"💻", label:"코딩 / 작업" },
  { value:"tidy",     emoji:"🧹", label:"청소 / 정리" },
  { value:"reading",  emoji:"📖", label:"독서" },
  { value:"streaming",emoji:"📺", label:"넷플릭스 / 영상" },
  { value:"meditation",emoji:"🧘", label:"명상" },
  { value:"drinking", emoji:"🍺", label:"술자리 / 모임" },
  { value:"shopping", emoji:"🛍️", label:"쇼핑" },
  { value:"drive",    emoji:"🚗", label:"드라이브" },
  { value:"foodtour", emoji:"🍜", label:"맛집 탐방" },
];

// ─── 소다 색상 ────────────────────────────────────────────
export const SODA_COLORS = [
  ["#fff7ed", "#f97316"],
  ["#f0fdf4", "#22d3a5"],
  ["#fefce8", "#facc15"],
  ["#eff6ff", "#6366f1"],
  ["#f5f3ff", "#a78bfa"],
  ["#ecfdf5", "#34d399"],
];

export const RED_COLORS = [["#fff1f2", "#dc2626"]];

export const BUBBLES = [
  { left:"8%",size:4,dur:3.2,delay:0.3 },{ left:"18%",size:7,dur:2.8,delay:0.9 },
  { left:"25%",size:3,dur:3.8,delay:1.6 },{ left:"42%",size:8,dur:3.5,delay:1.2 },
  { left:"57%",size:6,dur:2.9,delay:0.4 },{ left:"72%",size:9,dur:2.6,delay:0.7 },
  { left:"88%",size:5,dur:3.0,delay:1.0 },{ left:"47%",size:4,dur:2.7,delay:2.1 },
];

// ─── Vibe 한글 매핑 ────────────────────────────────────────
export const VIBE_KO = {
  고요함:"고요함",따뜻함:"따뜻함",아무생각없이:"아무 생각 없이",느리게:"천천히",몸회복:"몸 회복",
  감성충전:"감성 충전",수동적소비:"수동적 소비",혼자만의시간:"혼자만의 시간",
  뿌듯함:"뿌듯함",완성하는기쁨:"완성의 기쁨",지적자극:"지적 자극",정리정돈:"정리정돈",정신정리:"생각 정리",
  두근거림:"두근거림",새로운경험:"새로운 경험",도전:"도전",웃음:"웃음",
  자연감성:"자연 감성",기다리는맛:"기다리는 맛",야간감성:"밤 감성",자유로움:"자유로움",
  소소한사치:"소소한 사치",집중:"집중",땀흘리기:"땀 흘리기",같이하면더좋은:"함께",
  맛탐험:"맛 탐험",충전:"충전",비우는기쁨:"비우는 기쁨",리셋:"리셋",
};
