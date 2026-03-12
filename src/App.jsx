import { useState, useEffect, useRef } from "react";

const S = {
  screen: { maxWidth:480, margin:"0 auto", padding:"24px 20px 80px" },
  sectionTag: { display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:"1.5px", color:"#888", textTransform:"uppercase", marginBottom:6 },
  qCard: { background:"#fff", borderRadius:20, padding:20, marginBottom:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  qLabel: { fontSize:17, fontWeight:700, marginBottom:14, color:"#191919" },
  optRow: { display:"flex", flexDirection:"column", gap:8 },
  optBtn: (selected) => ({ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderRadius:14, border: selected ? "1.5px solid #191919" : "1.5px solid #ECEAE4", background: selected ? "#191919" : "#FAFAF8", cursor:"pointer", transition:"all 0.18s", fontFamily:"inherit", width:"100%" }),
  optLabel: (selected) => ({ fontSize:15, fontWeight:500, color: selected ? "#fff" : "#191919" }),
  startBtn: (disabled) => ({ width:"100%", padding:17, background: disabled ? "#D0CEC8" : "#191919", color: disabled ? "#999" : "#fff", border:"none", borderRadius:16, fontSize:16, fontWeight:800, cursor: disabled ? "default" : "pointer", fontFamily:"inherit", marginTop:24 }),
};

// ─── 활동 데이터 (genre 태그 추가, 101개) ─────────────────
const ACTIVITIES = [
  // ── HEALING ──
  { id:1,  name:"반신욕",            emoji:"🛁",  time:40,  genre:"healing", vibe:["고요함","따뜻함","혼자만의시간","몸회복","느리게","충전"], hint:"몸의 긴장이 풀리면 머리도 같이 풀려. 생각 정리하기 제일 좋은 시간.", tip:"입욕제 하나 던져넣으면 분위기 완전 달라짐. 38~40도가 딱 좋아.", tags:{ energy:["low","mid"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:2,  name:"향초 켜고 드라마",  emoji:"🕯️", time:90,  genre:"healing", vibe:["고요함","따뜻함","감성충전","수동적소비","아무생각없이","혼자만의시간"], hint:"시각이랑 후각 동시에 만족시키는 조합. 완전한 나만의 시간.", tip:"향초 없으면 디퓨저나 아로마 오일도 돼. 조명 낮추면 더 몰입됨.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:3,  name:"음악 틀고 멍때리기",emoji:"🎵",  time:30,  genre:"healing", vibe:["고요함","아무생각없이","느리게","정신정리"], hint:"아무것도 안 하는 게 사실 제일 어려운 일. 음악이 있으면 괜찮아.", tip:"평소 안 듣던 장르 틀어봐. 재즈나 보사노바 추천.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:4,  name:"낮잠",              emoji:"😴",  time:60,  genre:"healing", vibe:["아무생각없이","몸회복","느리게","충전"], hint:"20분 낮잠이 커피 한 잔보다 효과 좋다는 연구 있어. 근데 그냥 자도 돼.", tip:"알람 없이 자면 더 개운함. 죄책감 갖지 마, 몸이 필요하다는 신호야.", tags:{ energy:["low"], need:["힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:5,  name:"ASMR + 스트레칭",  emoji:"🧘",  time:20,  genre:"healing", vibe:["고요함","몸회복","느리게","혼자만의시간"], hint:"뭉친 근육 하나만 풀어도 기분이 달라짐. 몸이 가벼워지면 마음도 따라와.", tip:"유튜브에 '10분 스트레칭' 검색하면 따라하기 쉬운 거 많아.", tags:{ energy:["low","mid"], need:["힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:6,  name:"팟캐스트 누워듣기", emoji:"🎙️", time:45,  genre:"healing", vibe:["아무생각없이","수동적소비","느리게","혼자만의시간"], hint:"귀만 열어두면 돼. 눈 감고 누워도 되고 멍하니 천장 봐도 돼.", tip:"자연 다큐 나레이션이나 역사 팟캐스트가 자극 없이 듣기 좋아.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:7,  name:"명상 / 마음챙김",  emoji:"🪷",  time:20,  genre:"healing", vibe:["고요함","아무생각없이","정신정리","비우는기쁨","집중"], hint:"5분만 제대로 해도 머리가 맑아져. 생각의 속도를 늦추는 연습이야.", tip:"유튜브 '가이드 명상' 검색하거나 코끼리 앱 써봐. 눈 감고 누워도 돼.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:8,  name:"아로마 족욕",       emoji:"🫧",  time:30,  genre:"healing", vibe:["고요함","따뜻함","몸회복","충전"], hint:"발만 담가도 혈액순환이 달라져. 따뜻함이 온몸으로 퍼져나가는 느낌.", tip:"따뜻한 물에 에센셜오일 몇 방울이면 충분. 소금 넣어도 좋아.", tags:{ energy:["low"], need:["힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:9,  name:"핫팩 + 이불 속",   emoji:"🛌",  time:30,  genre:"healing", vibe:["따뜻함","아무생각없이","느리게","충전"], hint:"따뜻함 속에서 아무것도 안 해도 돼. 가장 원초적인 힐링.", tip:"핫팩 없으면 전기장판도 충분. 좋아하는 향기 나는 거 같이 있으면 더 좋아.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:10, name:"사우나 / 온천",     emoji:"♨️",  time:120, genre:"healing", vibe:["따뜻함","몸회복","리셋","기분전환","충전"], hint:"몸 전체를 따뜻하게 담그면 긴장이 한꺼번에 풀려. 멘탈 피로에도 최고.", tip:"동네 목욕탕도 충분해. 때밀이 받으면 몸이 새것 같아.", tags:{ energy:["low","mid"], need:["힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:11, name:"요가 / 필라테스",   emoji:"🧘",  time:60,  genre:"fitness", vibe:["몸회복","느리게","뿌듯함","정신정리","충전"], hint:"몸 정렬하면서 마음도 같이 정리돼. 한 시간 후 완전히 다른 사람 느낌.", tip:"동네 요가원 첫 달 할인 많아. 유튜브 요가도 충분하긴 해.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["out"], alone:["혼자"], cost:["조금"] }},

  // ── MEDIA / CULTURE ──
  { id:12, name:"웹툰 정주행",       emoji:"📱",  time:60,  genre:"culture", vibe:["수동적소비","아무생각없이","혼자만의시간","집중","웃음"], hint:"완결된 거 고르면 끊기는 스트레스 없음. 몰입하다 보면 시간 훅 가.", tip:"네이버/카카오 무료 작품 꽤 많아. 장르물이 정주행하기 제일 좋아.", tags:{ energy:["low"], need:["멍때리기","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:13, name:"유튜브 알고리즘",   emoji:"▶️",  time:60,  genre:"culture", vibe:["수동적소비","아무생각없이","혼자만의시간"], hint:"내가 뭘 좋아하는지 알고리즘이 나보다 더 잘 알 때가 있어.", tip:"자동재생 켜두고 그냥 흘려봐. 억지로 고르지 않아도 돼.", tags:{ energy:["low"], need:["멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:14, name:"넷플릭스 영화",     emoji:"🎬",  time:120, genre:"culture", vibe:["수동적소비","감성충전","혼자만의시간"], hint:"2시간 동안 완전히 다른 세계에 있다 올 수 있어. 현실 환기 최고.", tip:"고르는 데 30분 쓰지 말고 평점 7점 이상 아무거나 눌러. 그게 나아.", tags:{ energy:["low","mid"], need:["힐링","자극"], location:["home"], alone:["혼자","같이"], cost:["무료"] }},
  { id:15, name:"단편 / 독립영화",   emoji:"🎞️",  time:60,  genre:"culture", vibe:["감성충전","새로운시각","혼자만의시간"], hint:"짧은데 여운이 길어. 주류에서 볼 수 없는 시각으로 세상을 봄.", tip:"왓챠, 유튜브 단편 채널에 좋은 거 많아. 시간 부담도 없어.", tags:{ energy:["low","mid"], need:["힐링","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:16, name:"책 읽기",           emoji:"📖",  time:60,  genre:"culture", vibe:["고요함","느리게","감성충전","혼자만의시간","새로운경험"], hint:"읽다 보면 어느 순간 완전히 다른 곳에 가있어. 최고의 현실 도피.", tip:"못 읽어도 돼. 5페이지 읽다 자도 오늘 책 읽은 거야.", tags:{ energy:["low","mid"], need:["힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:17, name:"독서카페 가기",     emoji:"☕",  time:90,  genre:"culture", vibe:["고요함","감성충전","익명의공간"], hint:"카페 분위기에 책까지 있으니 힐링 두 배. 의외로 집중도 잘 돼.", tip:"책 안 읽어도 돼. 그냥 공간 즐기다 눈에 띄는 책 펼쳐봐.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:18, name:"TED 강연 보기",     emoji:"🧠",  time:20,  genre:"culture", vibe:["지적자극","새로운시각","혼자만의시간"], hint:"18분짜리 한 편으로 완전히 다른 세계관 접할 수 있어. 뇌에 신선한 자극.", tip:"'Most popular TED Talks' 검색하면 검증된 것들 나와. 한국어 자막 있어.", tags:{ energy:["low","mid"], need:["자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:19, name:"위키피디아 탐험",   emoji:"🔍",  time:30,  genre:"culture", vibe:["지적자극","새로운시각","아무생각없이","혼자만의시간"], hint:"링크 타고 들어가다 보면 처음이랑 전혀 다른 주제에 가있어. 뇌 산책이야.", tip:"위키피디아 랜덤 문서 버튼 눌러봐. 뭐가 나올지 모르는 게 재밌어.", tags:{ energy:["low","mid"], need:["자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:20, name:"전시회 / 갤러리",   emoji:"🖼️",  time:90,  genre:"culture", vibe:["감성충전","느리게","새로운시각","혼자만의시간"], hint:"작품 앞에서 멈추는 그 시간이 일상에서 찾기 힘든 여백이야.", tip:"국공립 미술관은 무료거나 저렴해. 인스타에서 '전시 추천' 검색해봐.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},
  { id:21, name:"공연 / 뮤지컬",     emoji:"🎭",  time:150, genre:"culture", vibe:["감성충전","두근거림","특별한경험","같이하면더좋은","웃음"], hint:"라이브의 에너지가 달라. 같은 공간에서 같이 울고 웃는 경험.", tip:"인터파크 티켓에서 당일할인권 찾아봐. 생각보다 저렴하게 볼 수 있어.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},

  // ── COOKING ──
  { id:22, name:"홈카페 차려먹기",   emoji:"☕",  time:30,  genre:"cooking", vibe:["따뜻함","뿌듯함","충전","완성하는기쁨","고요함"], hint:"카페 가는 돈 아끼고 내 취향대로 만드는 맛이 있어.", tip:"달고나 커피, 아인슈패너, 수제 에이드 — 유튜브에 레시피 다 있어.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:23, name:"새 레시피 도전",    emoji:"🍳",  time:60,  genre:"cooking", vibe:["집중","뿌듯함","완성하는기쁨","기분전환"], hint:"만드는 과정 자체가 집중력을 요구해서 딴 생각 안 하게 됨.", tip:"망해도 괜찮아. 냉장고 재료 기반으로 만개의레시피 검색해봐.", tags:{ energy:["mid"], need:["성취감"], location:["home"], alone:["혼자","같이"], cost:["조금"] }},
  { id:24, name:"베이킹 도전",       emoji:"🧁",  time:90,  genre:"cooking", vibe:["집중","완성하는기쁨","뿌듯함","기분전환"], hint:"정확한 계량이 필요해서 오히려 머리가 비워짐. 완성품의 성취감도.", tip:"머핀이나 스콘이 제일 쉬워. 밀가루 버터 설탕 계란만 있으면 가능.", tags:{ energy:["mid","high"], need:["성취감"], location:["home"], alone:["혼자","같이"], cost:["조금"] }},
  { id:25, name:"라면 업그레이드",   emoji:"🍜",  time:20,  genre:"cooking", vibe:["따뜻함","소소한사치","간단하게","기분전환"], hint:"라면도 조금만 손보면 완전히 달라져. 간단한데 성취감 있어.", tip:"계란 + 파 + 치즈만 있으면 됨. 스프 반 봉지에 된장 조금 넣으면 깊어져.", tags:{ energy:["low","mid"], need:["성취감","힐링"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:26, name:"혼밥 도전 (외식)",  emoji:"🍖",  time:60,  genre:"cooking", vibe:["자유로움","혼자만의시간","소소한사치","기분전환"], hint:"혼자 맛있는 거 먹는 게 사실 제일 자유로움. 눈치 안 봐도 되잖아.", tip:"평소 가고 싶었던 데 지금 가봐. 혼자면 자리 빨리 나고 웨이팅도 짧아.", tags:{ energy:["mid"], need:["자극","성취감"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:27, name:"맛집 가기",         emoji:"🍽️",  time:90,  genre:"cooking", vibe:["같이하면더좋은","소소한사치","맛탐험","기분전환"], hint:"맛있는 거 먹으면서 나누는 대화가 제일 자연스러워.", tip:"미리 예약해두면 웨이팅 스트레스 없이 느긋하게 즐길 수 있어.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["같이"], cost:["조금","상관없어"] }},
  { id:28, name:"편의점 야식 투어",  emoji:"🏪",  time:30,  genre:"cooking", vibe:["소소한사치","야간감성","맛탐험","기분전환"], hint:"작은 사치야. 먹고 싶은 거 다 사도 만원 안 넘어.", tip:"신상 과자나 컵라면 먹어보는 게 소소한 재미.", tags:{ energy:["low","mid"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},

  // ── TIDY ──
  { id:29, name:"방 청소 한 구역만", emoji:"🧹",  time:30,  genre:"tidy", vibe:["뿌듯함","리셋","간단하게","비우는기쁨"],    hint:"전부 다 안 해도 돼. 책상 위 하나만 치워도 기분이 달라짐.", tip:"타이머 20분 맞추고 그 시간만 하는 거야. 끝나면 진짜 끝.", tags:{ energy:["mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:30, name:"옷장 정리",         emoji:"👕",  time:45,  genre:"tidy", vibe:["뿌듯함","비우는기쁨","정리정돈","리셋"],    hint:"1년 안 입은 옷은 앞으로도 안 입어. 비우면 선택이 쉬워져.", tip:"당근마켓에 올리면 용돈도 되고 누군가한테 필요한 물건이 됨.", tags:{ energy:["mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:31, name:"당근마켓 올리기",   emoji:"📦",  time:30,  genre:"tidy", vibe:["뿌듯함","비우는기쁨","간단하게","리셋"],    hint:"집에 잠자는 물건이 누군가에겐 필요한 거야. 비우면 마음도 가벼워.", tip:"사진 잘 찍고 시세보다 살짝 낮게 올리면 빨리 팔림.", tags:{ energy:["mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:32, name:"핸드폰 사진 정리",  emoji:"🖼️",  time:30,  genre:"tidy", vibe:["뿌듯함","정리정돈","간단하게","비우는기쁨"],    hint:"저장공간 확보되고 추억도 다시 보게 돼. 의외로 기분 좋아짐.", tip:"구글 포토 중복 사진 삭제 기능 써봐. 용량 엄청 줄어.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:33, name:"구독 / 앱 정리",    emoji:"📲",  time:20,  genre:"tidy", vibe:["뿌듯함","비우는기쁨","리셋","정신정리"],    hint:"쓰지도 않는데 빠져나가는 돈 막아. 정리하면 홀가분해.", tip:"결제 내역 한 번만 훑어봐. 카드사 앱에서 정기결제 확인 가능.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},

  // ── DIGITAL ──
  { id:34, name:"새 앱 만들어보기",  emoji:"💻",  time:120, genre:"digital", vibe:["비우는기쁨","리셋","정리정돈","정신정리"],  hint:"아이디어를 실제로 만드는 과정이 제일 짜릿함. 완성 못 해도 괜찮아.", tip:"Claude Code나 Cursor로 시작해봐. 코드 몰라도 아이디어만 있으면 돼.", tags:{ energy:["high"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:35, name:"스팀 게임 털기",    emoji:"🎮",  time:90,  genre:"digital", vibe:["간단하게","리셋","뿌듯함","비우는기쁨"],  hint:"돈 주고 산 게임 안 한 채로 쌓여있잖아. 오늘 하나 시작해봐.", tip:"5분 해보고 재미없으면 바로 다음 거 켜도 돼. 부담 갖지 마.", tags:{ energy:["mid"], need:["자극","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:36, name:"구글맵 해외여행",   emoji:"🌍",  time:20,  genre:"digital", vibe:["뿌듯함","리셋","간단하게","비우는기쁨"],  hint:"스트리트뷰로 파리 골목, 일본 시장 구경할 수 있어. 공짜 여행.", tip:"가보고 싶은 도시 검색하고 스트리트뷰 눌러봐. 생각보다 몰입됨.", tags:{ energy:["low","mid"], need:["자극","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:37, name:"영상 편집 도전",    emoji:"🎬",  time:90,  genre:"digital", vibe:["정리정돈","뿌듯함","간단하게","비우는기쁨"],  hint:"일상 영상 하나만 편집해봐도 '내가 이런 날을 살았구나' 싶어.", tip:"캡컷이 제일 쉬워. 스마트폰으로 바로 가능.", tags:{ energy:["mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},

  // ── ART ──
  { id:38, name:"일기 쓰기",         emoji:"📝",  time:20,  genre:"art", vibe:["뿌듯함","정리정돈","리셋","비우는기쁨"],     hint:"쓰다 보면 내가 왜 힘든지 보여. 머릿속에서 꺼내놓는 것만으로도 달라짐.", tip:"잘 쓰려고 하지 마. 오늘 있었던 일 세 줄이면 충분해.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:39, name:"플레이리스트 만들기",emoji:"🎧",  time:30,  genre:"art", vibe:["집중","지적자극","완성하는기쁨","도전","짜릿함"],     hint:"내 감정을 음악으로 큐레이션하는 거야. 나중에 꺼내 들으면 그때 기분이 다시 옴.", tip:"주제나 분위기 정해두고 만들면 더 재밌어. '비 오는 날 밤' 같은 거.", tags:{ energy:["low","mid"], need:["성취감","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:40, name:"수채화 그리기",     emoji:"🎨",  time:60,  genre:"art", vibe:["수동적소비","아무생각없이","웃음","짜릿함","도전"],     hint:"잘 그려야 한다는 부담 내려놓으면 그냥 색칠하는 것 자체가 명상이야.", tip:"유튜브 수채화 튜토리얼 따라하면 돼. 기초 세트 만원대면 구매 가능.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:41, name:"뜨개질 / 자수",     emoji:"🧶",  time:90,  genre:"art", vibe:["새로운시각","지적자극","아무생각없이","기분전환"],     hint:"바늘 하나 실 하나. 반복적인 동작이 오히려 뇌를 쉬게 해줘.", tip:"유튜브 기초 영상 보면서 시작해봐. 도안 하나 사면 재료도 같이 와.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:42, name:"악기 연습",         emoji:"🎸",  time:60,  genre:"art", vibe:["집중","완성하는기쁨","뿌듯함","기분전환"],     hint:"한 소절만 제대로 쳐도 성취감이 엄청나. 몰입하면 시간 가는 줄 몰라.", tip:"기타 코드 3개만 알면 노래 수십 곡 가능. 유튜브로 독학 충분해.", tags:{ energy:["mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:43, name:"버킷리스트 작성",   emoji:"✍️",  time:20,  genre:"art", vibe:["소소한사치","기대감","기분전환"],     hint:"하고 싶은 거 쓰다 보면 살고 싶어짐. 막연한 기대감이 생겨.", tip:"이미 한 것도 써보고 줄 그어봐. 생각보다 많이 살았다는 게 보여.", tags:{ energy:["low","mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:44, name:"여행 계획 짜기",    emoji:"✈️",  time:40,  genre:"art", vibe:["감성충전","기대감","혼자만의시간"],     hint:"안 가도 돼. 짜는 것만으로 설레고 기대감 생겨.", tip:"에어비앤비, 구글 맵, 유튜브 브이로그 같이 열어놓고 짜봐.", tags:{ energy:["low","mid"], need:["자극","성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:45, name:"글쓰기 / 단편소설", emoji:"🖊️",  time:60,  genre:"art", vibe:["집중","혼자만의시간","익명의공간","기분전환"],     hint:"머릿속 생각을 이야기로 풀어내면 생각지도 못한 데 닿을 때가 있어.", tip:"완성 안 해도 돼. 오늘 쓰고 싶은 장면 하나만 써봐.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:46, name:"홈 가드닝",         emoji:"🪴",  time:30,  genre:"art", vibe:["정신정리","감성충전","느리게","혼자만의시간"],     hint:"식물 한 포기가 집의 분위기를 바꿔줘. 키우다 보면 정이 들어.", tip:"다이소 식물부터 시작해봐. 다육이나 공기정화식물 추천.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:47, name:"사진 찍으러 나가기",emoji:"📷",  time:90,  genre:"art", vibe:["감성충전","뿌듯함","완성하는기쁨","혼자만의시간"],     hint:"카메라 들면 평소에 안 보이던 게 보여. 같은 동네가 다르게 느껴짐.", tip:"스마트폰으로 충분해. 인스타 올릴 생각 말고 내 눈에 예쁜 거 찍어봐.", tags:{ energy:["mid","high"], need:["성취감","자극"], location:["out"], alone:["혼자"], cost:["무료"] }},

  // ── CRAFT ──
  { id:48, name:"도자기 공방",       emoji:"🏺",  time:120, genre:"craft", vibe:["집중","감성충전","느리게","혼자만의시간"],   hint:"흙 만지는 촉감이 이상하게 마음을 편하게 해줘. 집중하다 보면 시간 훅 가.", tip:"네이버에 '도자기 체험' 검색하면 당일 가능한 곳 많아.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:49, name:"가죽공방",          emoji:"👜",  time:120, genre:"craft", vibe:["집중","고요함","완성하는기쁨","느리게","혼자만의시간"],   hint:"내가 쓸 물건을 직접 만드는 뿌듯함. 완성품을 오래 쓸 수 있어서 더 특별해.", tip:"카드지갑이나 키링부터 시작해봐. 재료비 포함 3~5만원 정도.", tags:{ energy:["mid"], need:["성취감"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:50, name:"캔들 / 디퓨저 만들기",emoji:"🕯️",time:90, genre:"craft", vibe:["집중","완성하는기쁨","도전","뿌듯함","짜릿함"],   hint:"향기 고르는 것부터 힐링이야. 만들고 나서 집에 두면 매일 기분 좋아져.", tip:"원데이 클래스 찾아봐. 재료 다 줘.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:51, name:"유리공예",          emoji:"🪟",  time:120, genre:"craft", vibe:["기대감","정신정리","혼자만의시간"],   hint:"빛이 통과할 때 색이 달라지는 게 신기해. 완성품이 인테리어가 됨.", tip:"원데이 체험 수업 찾아봐. 기초는 2시간이면 충분히 만들 수 있어.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:52, name:"플라워 클래스",     emoji:"💐",  time:90,  genre:"craft", vibe:["기대감","지적자극","혼자만의시간"],   hint:"꽃 다듬고 배치하는 과정이 명상 같아. 완성된 꽃다발 보면 뿌듯해.", tip:"원데이 클래스 3~5만원대. 완성품 집에 가져갈 수 있어.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:53, name:"향수 만들기",       emoji:"🧴",  time:90,  genre:"craft", vibe:["집중","감성충전","완성하는기쁨","혼자만의시간"],   hint:"내 향기를 직접 만드는 경험. 향 고르는 것부터 이미 힐링이야.", tip:"조향 체험 클래스 찾아봐. 완성된 향수 가져갈 수 있어.", tags:{ energy:["mid"], need:["힐링","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:54, name:"테라리움 만들기",   emoji:"🌱",  time:60,  genre:"craft", vibe:["느리게","뿌듯함","고요함","혼자만의시간"],   hint:"작은 유리병 속에 작은 세계를 만드는 거야.", tip:"꽃집이나 공방에서 체험 가능. 재료 키트 온라인으로도 구매 가능.", tags:{ energy:["low","mid"], need:["성취감","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},

  // ── TRAVEL ──
  { id:55, name:"드라이브",          emoji:"🚗",  time:60,  genre:"travel", vibe:["집중","새로운시각","혼자만의시간","기분전환"],  hint:"목적지 없이 달리는 것만으로 기분 전환돼. 창문 열고 음악 크게.", tip:"한 시간 거리 바다나 산 방향으로 그냥 달려봐. 가는 길이 목적지야.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:56, name:"바다 드라이브",     emoji:"🌊",  time:120, genre:"travel", vibe:["집중","간단하게","뿌듯함"],  hint:"바다 소리랑 냄새가 머릿속을 씻어줘. 가는 것만으로도 이미 힐링 시작.", tip:"창문 열고 파도 소리 들으면서 차 안에 앉아있어도 충분해.", tags:{ energy:["mid"], need:["힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:57, name:"야경 보러 가기",    emoji:"🌃",  time:60,  genre:"travel", vibe:["감성충전","느리게","혼자만의시간"],  hint:"낮과 다른 도시를 보면 같은 공간인데 다른 세계 같아. 감성 충전 최고.", tip:"전망대, 한강, 야트막한 뒷산도 좋아.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["무료"] }},
  { id:58, name:"별 보기 / 천문대",  emoji:"🌌",  time:120, genre:"travel", vibe:["소소한사치","뿌듯함","기분전환"],  hint:"별 보면서 내 고민이 얼마나 작은지 느껴져. 스케일이 달라지는 경험.", tip:"근처 천문대 찾아봐. 맑은 날 차 타고 나가서 누워서 봐도 충분해.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},
  { id:59, name:"플리마켓 구경",     emoji:"🛍️",  time:90,  genre:"travel", vibe:["정신정리","야간감성","느리게","혼자만의시간"],  hint:"안 사도 돼. 구경만 해도 자극이 됨. 사람 구경도 재밌어.", tip:"서울숲, 홍대 주변 주말 플리마켓 정기적으로 열려.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},
  { id:60, name:"서점 구경",         emoji:"📚",  time:60,  genre:"travel", vibe:["집중","완성하는기쁨","느리게","새로운경험","특별한경험"],  hint:"살 생각 없어도 돼. 제목만 훑어봐도 자극이 됨.", tip:"독립서점이 큐레이션 잘 해둬서 대형서점보다 재밌을 수 있어.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자"], cost:["무료","조금"] }},
  { id:61, name:"동네 카페 탐방",    emoji:"☕",  time:60,  genre:"travel", vibe:["집중","완성하는기쁨","뿌듯함","특별한경험","소소한사치"],  hint:"환경이 바뀌면 기분도 달라져. 집에서 나오는 것만으로 리셋됨.", tip:"단골 카페 말고 처음 가는 데 한 번 들어가봐.", tags:{ energy:["mid"], need:["힐링","성취감"], location:["out"], alone:["혼자"], cost:["조금"] }},

  // ── NATURE ──
  { id:62, name:"공원 산책",         emoji:"🌿",  time:40,  genre:"nature", vibe:["집중","감성충전","완성하는기쁨","따뜻함","소소한사치"],  hint:"자연 속에서 걸으면 코르티솔이 줄어든다고 해. 과학적으로 스트레스 해소됨.", tip:"이어폰 빼고 그냥 걸어봐. 처음엔 어색해도 적응되면 더 좋아.", tags:{ energy:["mid"], need:["힐링"], location:["out"], alone:["혼자","같이"], cost:["무료"] }},
  { id:63, name:"캠핑",              emoji:"⛺",  time:480, genre:"nature", vibe:["집중","완성하는기쁨","특별한경험","새로운경험"],  hint:"자연 속에서 하룻밤. 일상에서 완전히 분리되는 경험이야.", tip:"오토캠핑장부터 시작해봐. 텐트 없어도 렌탈 가능한 곳 많아.", tags:{ energy:["mid","high"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:64, name:"글램핑",            emoji:"🏕️",  time:480, genre:"nature", vibe:["집중","완성하는기쁨","감성충전","소소한사치"],  hint:"캠핑의 감성에 편의시설 추가. 준비 없이도 자연 속 하룻밤 가능.", tip:"예약 필수. 가격대 다양하게 있으니까 비교해봐.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:65, name:"트레킹 / 둘레길",   emoji:"🥾",  time:150, genre:"nature", vibe:["감성충전","특별한경험","완성하는기쁨","소소한사치"],  hint:"등산보다 느리고 산책보다 깊어. 길을 따라 걷다 보면 생각이 정리돼.", tip:"북한산 둘레길, 제주 올레길 추천. 1~2시간짜리부터 시작.", tags:{ energy:["mid"], need:["힐링","성취감"], location:["out"], alone:["혼자","같이"], cost:["무료"] }},
  { id:66, name:"일출 / 일몰 보기",  emoji:"🌅",  time:60,  genre:"nature", vibe:["집중","완성하는기쁨","뿌듯함","자연감성"],  hint:"그냥 보는 것만으로 마음이 리셋되는 느낌이야. 말이 필요 없어.", tip:"일출은 부지런해야 하지만 일몰은 언제든 가능. 높은 데 올라가봐.", tags:{ energy:["low","mid"], need:["힐링"], location:["out"], alone:["혼자","같이"], cost:["무료"] }},

  // ── MOUNTAIN ──
  { id:67, name:"등산",              emoji:"⛰️",  time:180, genre:"mountain", vibe:["자유로움","기분전환","혼자만의시간","리셋"],hint:"올라가면서 힘들고 내려오면서 다 잊어버려. 정상에서 보는 뷰는 보너스.", tip:"동네 뒷산부터 시작해봐. 30분짜리도 충분히 효과 있어.", tags:{ energy:["high"], need:["성취감","힐링"], location:["out"], alone:["혼자","같이"], cost:["무료"] }},
  { id:68, name:"암벽 / 클라이밍",   emoji:"🧗",  time:90,  genre:"mountain", vibe:["자연감성","리셋","자유로움","기분전환"],hint:"다음 홀드 어디 잡을지만 생각하게 돼. 일상 고민이 싹 사라짐.", tip:"실내 클라이밍장 전국 어디든 있어. 장비 렌탈 가능하고 강습도 있어.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:69, name:"패러글라이딩",      emoji:"🪂",  time:120, genre:"mountain", vibe:["야간감성","감성충전","기분전환","혼자만의시간"],hint:"하늘에서 내려다보는 풍경이 완전히 다른 시각을 줘. 두려움이 사라지는 경험.", tip:"단양, 양평, 제주 체험 업체 많아. 탠덤으로 같이 타면 초보도 가능.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},

  // ── WATER ──
  { id:70, name:"찌낚시",            emoji:"🎣",  time:180, genre:"water", vibe:["야간감성","자연감성","감성충전","리셋","특별한경험"],   hint:"느리게 기다리는 맛이 있어. 찌가 올라오는 순간의 짜릿함은 중독성 있음.", tip:"방파제나 방조제에서 시작해봐. 민물낚시 세트 하나면 충분해.", tags:{ energy:["low","mid"], need:["힐링","멍때리기"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:71, name:"루어낚시",          emoji:"🪝",  time:180, genre:"water", vibe:["새로운경험","기분전환","소소한사치","같이하면더좋은"],   hint:"직접 움직이면서 물고기를 유혹하는 거야. 찌낚시보다 역동적이고 집중력 필요.", tip:"스피너베이트나 지그헤드 하나면 시작 가능. 강이나 바다 어디든 됨.", tags:{ energy:["mid","high"], need:["자극","힐링"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:72, name:"바다낚시 (선상)",   emoji:"⛵",  time:300, genre:"water", vibe:["지적자극","느리게","혼자만의시간","고요함"],   hint:"배 타고 나가면 완전히 다른 세계야. 대어 잡을 때 손맛이 달라.", tip:"낚시 어선 예약 앱으로 쉽게 예약 가능. 멀미약 챙겨가.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:73, name:"민물낚시 (저수지)", emoji:"🏞️",  time:240, genre:"water", vibe:["기분전환","혼자만의시간","소소한사치","익명의공간"],   hint:"조용한 저수지 앞에 앉아있는 것만으로 힐링이야. 세상이 멈춘 느낌.", tip:"낚시터 입장료 내면 장비 렌탈도 가능한 곳 많아.", tags:{ energy:["low","mid"], need:["힐링","멍때리기"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:74, name:"스노클링",          emoji:"🤿",  time:180, genre:"water", vibe:["새로운경험","자유로움","혼자만의시간","기분전환"],   hint:"물속에서 보는 세상은 완전히 달라. 바다 위에 떠있는 것만으로도 힐링.", tip:"제주도나 동해 스노클 패키지 많아. 장비 렌탈 가능.", tags:{ energy:["mid","high"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:75, name:"스쿠버다이빙",      emoji:"🌊",  time:240, genre:"water", vibe:["자유로움","새로운경험","혼자만의시간","기분전환"],   hint:"수중 세계는 지상과 완전히 다른 차원이야. 소리도 없고 중력도 다르게 느껴져.", tip:"오픈워터 자격증 있으면 어디든 가능. 없으면 체험 다이빙부터 시작.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["상관없어"] }},
  { id:76, name:"서핑",              emoji:"🏄",  time:180, genre:"water", vibe:["기분전환","소소한사치","간단하게"],   hint:"파도 타는 순간 아무 생각 없어. 몸이 반응하는 대로 움직이면 돼.", tip:"양양이나 제주 서핑스쿨 많아. 초보 강습 2~3시간이면 파도 탈 수 있어.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:77, name:"카약 / 카누",       emoji:"🛶",  time:120, genre:"water", vibe:["감성충전","간단하게","기분전환","소소한사치"],   hint:"물 위에서 노 젓는 리듬이 명상 같아. 조용한 강이나 호수 추천.", tip:"레저 업체에서 시간당 대여 가능. 2인용 카약은 같이 타기도 좋아.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:78, name:"수상 스키 / 웨이크보드",emoji:"🎿",time:90,genre:"water", vibe:["야간감성","자유로움","혼자만의시간","리셋","고요함"],  hint:"물 위를 달리는 속도감이 짜릿해. 넘어져도 어차피 물이라 괜찮아.", tip:"레저 업체에서 강습 포함 체험 가능. 여름 시즌에 예약 필수.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["조금","상관없어"] }},
  { id:79, name:"래프팅",            emoji:"🌊",  time:120, genre:"water", vibe:["자연감성","리셋","아무생각없이","느리게","충전"],   hint:"급류 타면서 소리 지르다 보면 쌓인 스트레스가 한 방에 터져.", tip:"인제나 홍천 래프팅 업체 많아. 여름 시즌 예약 서두르는 게 좋아.", tags:{ energy:["high"], need:["자극"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:80, name:"수영",              emoji:"🏊",  time:60,  genre:"water", vibe:["자연감성","뿌듯함","느리게","정신정리","충전"],   hint:"물속에서 숨소리만 들리는 그 고요함. 유산소 중 제일 전신운동.", tip:"구청 수영장이 저렴해. 자유 수영 시간표 확인하고 가면 돼.", tags:{ energy:["mid","high"], need:["힐링","성취감"], location:["out"], alone:["혼자"], cost:["조금"] }},

  // ── CYCLING ──
  { id:81, name:"산악자전거",        emoji:"🚵",  time:120, genre:"cycling", vibe:["자연감성","리셋","감성충전","특별한경험"], hint:"산길 내리막 달릴 때의 쾌감은 다른 운동이랑 달라. 집중력 극대화.", tip:"입문용 자전거 있으면 동네 산도 충분해. 헬멧은 필수.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:82, name:"자전거 라이딩",     emoji:"🚴",  time:90,  genre:"cycling", vibe:["자연감성","아무생각없이","리셋","충전"], hint:"바람 맞으며 달리면 머리가 맑아짐. 이동이면서 운동이면서 힐링.", tip:"한강변, 낙동강변 자전거길 추천. 공유자전거로 시작해도 충분해.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},
  { id:83, name:"킥보드 / 인라인",   emoji:"🛴",  time:60,  genre:"cycling", vibe:["자연감성","감성충전","리셋","혼자만의시간"], hint:"바람 가르는 느낌이 자전거랑 또 달라. 가볍고 빠르게 움직이는 재미.", tip:"공원이나 강변 코스 추천. 헬멧 패드 챙기면 더 안전해.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},

  // ── FITNESS ──
  { id:84, name:"유튜브 홈트",       emoji:"💪",  time:30,  genre:"fitness", vibe:["자연감성","리셋","아침감성","충전"], hint:"땀 흘리고 나면 기분이 확 달라짐. 몸이 가벼워지면 머리도 맑아져.", tip:"'10분 홈트' 검색하면 누워서 하는 것도 있어. 그것부터 시작해.", tags:{ energy:["mid","high"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:85, name:"헬스장",            emoji:"🏋️",  time:90,  genre:"fitness", vibe:["자연감성","감성충전","특별한경험","기분전환"], hint:"무거운 거 들고 나면 자존감이 올라. 몸이 달라지는 게 보이면 더 재밌어.", tip:"PT 없이 혼자 시작해도 돼. 유튜브 운동 루틴 하나 잡고 따라해봐.", tags:{ energy:["high"], need:["성취감","자극"], location:["out"], alone:["혼자"], cost:["조금"] }},

  // ── SPORT ──
  { id:86, name:"배드민턴",          emoji:"🏸",  time:60,  genre:"sport", vibe:["야간감성","자유로움","혼자만의시간","리셋"],   hint:"공 치는 순간만 생각하게 돼. 가볍게 시작하기 좋아.", tip:"공원에서 공짜로 가능. 라켓 두 개에 셔틀콕만 있으면 돼.", tags:{ energy:["mid","high"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["무료","조금"] }},
  { id:87, name:"테니스",            emoji:"🎾",  time:90,  genre:"sport", vibe:["뿌듯함","자연감성","도전","정신정리","충전"],   hint:"공 맞는 타구감이 묘하게 스트레스 해소가 돼.", tip:"구청 코트 예약하면 저렴해. 레슨 한두 번 받으면 재밌어져.", tags:{ energy:["mid","high"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:88, name:"풋살 / 축구",       emoji:"⚽",  time:90,  genre:"sport", vibe:["뿌듯함","자연감성","간단하게","충전"],   hint:"몸 부딪히고 뛰면서 쌓인 거 다 털어내. 뛰고 나면 개운함이 달라.", tip:"풋살파크 대관 or 동네 조기축구 앱으로 매칭 찾아봐.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:89, name:"농구",              emoji:"🏀",  time:60,  genre:"sport", vibe:["집중","두근거림","도전","뿌듯함","짜릿함"],   hint:"슛 들어갈 때 그 느낌이 있어. 혼자도 연습하다 보면 시간 가.", tip:"동네 농구코트 어디든 있어. 혼자 3점슛 연습해도 충분히 재밌어.", tags:{ energy:["high"], need:["자극","성취감"], location:["out"], alone:["혼자","같이"], cost:["무료"] }},
  { id:90, name:"스크린 골프",       emoji:"⛳",  time:90,  genre:"sport", vibe:["두근거림","특별한경험","자유로움","도전","짜릿함"],   hint:"공 맞는 타구감이 묘하게 스트레스 해소가 돼. 혼자 집중하기도 좋아.", tip:"동네마다 하나씩 있어. 1인도 가능하고 가격도 생각보다 부담 없어.", tags:{ energy:["mid"], need:["자극","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:91, name:"볼링",              emoji:"🎳",  time:90,  genre:"sport", vibe:["고요함","아무생각없이","기다리는맛","자연감성","느리게","충전"],   hint:"잘 못 해도 핀 쓰러지면 짜릿해. 생각보다 몸 많이 쓰고 웃음 많이 나와.", tip:"2~3게임 하면 딱 좋아. 신발 포함 렌탈 다 해주니까 빈손으로 가도 돼.", tags:{ energy:["mid","high"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:92, name:"탁구",              emoji:"🏓",  time:60,  genre:"sport", vibe:["집중","두근거림","기다리는맛","자연감성","짜릿함"],   hint:"반응속도 싸움이라 생각할 틈이 없어. 집중하다 보면 머리가 비워져.", tip:"탁구장 대부분 시간제 이용 가능. 라켓 렌탈도 돼.", tags:{ energy:["mid"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:93, name:"스케이트",          emoji:"⛸️",  time:90,  genre:"sport", vibe:["두근거림","기다리는맛","특별한경험","자연감성","짜릿함"],   hint:"넘어져도 웃겨. 서툰 게 오히려 더 재밌는 종목이야.", tip:"겨울 시즌 실내 링크 많아. 스케이트 렌탈 가능.", tags:{ energy:["mid","high"], need:["자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},

  // ── SOCIAL ──
  { id:94, name:"술 한 잔",          emoji:"🍺",  time:120, genre:"social", vibe:["고요함","아무생각없이","기다리는맛","자연감성","느리게","충전"],  hint:"말 못했던 거 꺼내기 제일 좋은 시간. 적당히 마시면 대화가 깊어짐.", tip:"맥줏집보다 조용한 바가 더 잘 얘기됨.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:95, name:"노래방",            emoji:"🎤",  time:120, genre:"social", vibe:["두근거림","새로운경험","자연감성","특별한경험","짜릿함"],  hint:"소리 지르는 것만으로 스트레스 해소됨. 가창력 상관없이 쌓인 거 터트려.", tip:"18번 말고 평소에 안 부르는 장르 도전해봐.", tags:{ energy:["high"], need:["자극"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:96, name:"보드게임 카페",     emoji:"🎲",  time:120, genre:"social", vibe:["두근거림","도전","특별한경험","짜릿함"],  hint:"폰 없이 사람이랑 집중하는 경험. 요즘 보기 드문 시간이야.", tip:"직원한테 인원수랑 분위기 말하면 알맞은 게임 추천해줘.", tags:{ energy:["mid"], need:["자극"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:97, name:"방탈출",            emoji:"🔐",  time:90,  genre:"social", vibe:["두근거림","도전","땀흘리기","자연감성","짜릿함"],  hint:"60분 동안 완전히 다른 세계에 몰입해. 집중력이랑 협동심 극대화됨.", tip:"2~4인 적정. 난이도 쉬운 것부터 시작해봐. 예약 필수.", tags:{ energy:["mid","high"], need:["자극","성취감"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:98, name:"다트바 / 당구",     emoji:"🎯",  time:90,  genre:"social", vibe:["자연감성","느리게","고요함","충전"],  hint:"술 마시면서 다트 던지는 조합이 묘하게 중독성 있어. 경쟁심도 생겨.", tip:"다트 연습 앱으로 미리 연습해도 되고 현장에서 바로 배워도 돼.", tags:{ energy:["mid"], need:["자극"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:99, name:"VR 체험",           emoji:"🥽",  time:60,  genre:"social", vibe:["두근거림","짜릿함","소리지르고싶어","땀흘리기","같이하면더좋은"],  hint:"완전히 다른 세계에 들어가는 느낌. 현실에서 못 해보는 경험 가능.", tip:"VR 체험장 도심에 많아. 게임, 공포, 스포츠 등 장르 다양해.", tags:{ energy:["mid","high"], need:["자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},

  // ── PET ──
  { id:100,name:"재비 후키랑 놀기",  emoji:"🐕",  time:40,  genre:"pet", vibe:["두근거림","짜릿함","소리지르고싶어","같이하면더좋은"],     hint:"강아지는 그냥 네가 옆에 있는 것만으로 행복해. 그 에너지 받으면 나도 충전돼.", tip:"공 던지기, 터그놀이, 숨바꼭질. 뭘 해도 재비 후키는 좋아할 거야.", tags:{ energy:["low","mid"], need:["힐링"], location:["home"], alone:["강아지랑"], cost:["무료"] }},
  { id:101,name:"재비 후키랑 산책",  emoji:"🐾",  time:40,  genre:"pet", vibe:["고요함","땀흘리기","뿌듯함","충전"],     hint:"강아지 산책은 사실 내가 더 힐링됨. 얘들이 세상을 신기하게 보는 게 전염돼.", tip:"평소 안 가던 골목 방향으로 가봐. 재비 후키가 알아서 새 루트 개척해줄 거야.", tags:{ energy:["mid"], need:["힐링"], location:["out"], alone:["강아지랑"], cost:["무료"] }},
  { id:102,name:"강아지 목욕 / 그루밍",emoji:"🛁", time:60, genre:"pet", vibe:["두근거림","땀흘리기","자유로움","도전","짜릿함"],     hint:"씻기고 나서 폭신해진 거 보면 뿌듯함이 있어. 얘도 좋아함.", tip:"셀프 목욕 하려면 강아지 전용 샴푸 필요. 드라이기 낮은 온도로.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["home"], alone:["강아지랑"], cost:["무료","조금"] }},
  { id:103,name:"강아지 간식 만들기",emoji:"🦴",  time:45,  genre:"pet", vibe:["자유로움","자연감성","아무생각없이","충전"],     hint:"직접 만든 간식 먹을 때 좋아하는 거 보면 보람이 있어.", tip:"닭가슴살 에어프라이어로 구우면 끝. 단호박, 고구마도 좋아.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["home"], alone:["강아지랑"], cost:["조금"] }},

  // ── 사소한 일상 ──
  { id:104,name:"냉장고 파먹기 도전",emoji:"🥡",  time:30,  genre:"cooking", vibe:["자유로움","기분전환","간단하게"], hint:"있는 재료로만 뭔가 만드는 게 의외로 창의력 자극해. 망해도 그게 재밌어.", tip:"냉장고 사진 찍어두고 ChatGPT한테 레시피 물어봐. 의외로 잘 알려줘.", tags:{ energy:["mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:105,name:"달고나 커피 만들기",emoji:"☕",  time:20,  genre:"cooking", vibe:["땀흘리기","뿌듯함","간단하게","충전"], hint:"400번 젓는 그 과정 자체가 명상이야. 완성됐을 때 사진 찍고 싶어짐.", tip:"인스턴트 커피 + 설탕 + 뜨거운 물 1:1:1. 거품기 있으면 30초면 됨.", tags:{ energy:["low","mid"], need:["성취감","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:106,name:"편의점 디저트 조합",emoji:"🍰",  time:20,  genre:"cooking", vibe:["땀흘리기","뿌듯함","도전","집중","짜릿함"], hint:"편의점 재료로 럭셔리한 디저트 만드는 게 틱톡에서 유행이야. 생각보다 맛있음.", tip:"삼각김밥 + 컵라면 조합이나 아이스크림 + 과자 조합 도전해봐.", tags:{ energy:["low","mid"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:107,name:"좋아하는 노래 가사 외우기",emoji:"🎤",time:30,genre:"art", vibe:["땀흘리기","웃음","같이하면더좋은","기분전환"],  hint:"가사 외우다 보면 그 노래가 새롭게 들려. 아는 척하다 틀리는 것도 재밌어.", tip:"천천히 재생하면서 한 줄씩 따라 불러봐. 한 곡만 제대로 해봐.", tags:{ energy:["low","mid"], need:["성취감","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:108,name:"유튜브 먹방 대리만족",emoji:"📺",  time:30,  genre:"culture", vibe:["집중","땀흘리기","뿌듯함","짜릿함"],hint:"먹는 거 보는 것만으로 만족감이 생겨. 이상하지만 진짜야.", tip:"배고플 때 보면 더 고통스러우니까 뭔가 먹으면서 보는 게 좋아.", tags:{ energy:["low"], need:["멍때리기","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:109,name:"인스타 팔로우 정리",emoji:"📱",  time:20,  genre:"tidy", vibe:["땀흘리기","소리지르고싶어","같이하면더좋은","웃음"],    hint:"안 보는 계정 정리하면 피드가 맑아져. 디지털 미니멀리즘의 시작.", tip:"3초 봐서 설레지 않으면 언팔. 단호하게 가도 돼.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:110,name:"좋아하는 영화 다시 보기",emoji:"🎬",time:120,genre:"culture", vibe:["땀흘리기","두근거림","같이하면더좋은","짜릿함"],hint:"처음 봤을 때 못 잡은 장면이나 대사가 보여. 새로운 발견이 있어.", tip:"자막 끄고 봐봐. 집중도가 달라짐.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자","같이"], cost:["무료"] }},
  { id:111,name:"안 읽은 카톡 정리",  emoji:"💬",  time:15,  genre:"tidy", vibe:["집중","뿌듯함","소소한사치","기분전환"],    hint:"쌓인 알림 해결하면 의외로 홀가분해. 작은 숙제 하나 끝낸 느낌.", tip:"답장은 안 해도 돼. 읽기만 해도 충분해.", tags:{ energy:["low"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:112,name:"좋아하는 유튜버 정주행",emoji:"▶️",time:90,genre:"culture", vibe:["웃음","두근거림","같이하면더좋은","기분전환"], hint:"처음부터 보면 그 사람이 어떻게 성장했는지 보여. 이상하게 감동적임.", tip:"구독한 채널 중 오래된 영상부터 올라가봐.", tags:{ energy:["low"], need:["멍때리기","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:113,name:"넷플릭스 뭐볼까 탐색",emoji:"🍿",  time:20,  genre:"culture", vibe:["집중","웃음","같이하면더좋은","기분전환"],hint:"고르는 재미가 있어. 안 봐도 되고 그냥 탐색만 해도 됨.", tip:"장르별 숨겨진 코드 검색해봐. 평점 낮은 B급 영화도 재밌는 게 있어.", tags:{ energy:["low"], need:["멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:114,name:"이불 세탁 돌리기",   emoji:"🌀",  time:15,  genre:"tidy", vibe:["웃음","두근거림","새로운경험","같이하면더좋은"],    hint:"세탁기 돌려놓고 기다리는 그 시간이 묘하게 기분 좋아. 한 일이 생긴 느낌.", tip:"건조기 없으면 바람 잘 통하는 데 넓게 펴서 말려봐.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:115,name:"향수 컬렉션 테스트", emoji:"🧴",  time:15,  genre:"healing", vibe:["같이하면더좋은","웃음","하소연","기분전환"], hint:"향기 맡으면서 각각 어떤 상황에 어울리는지 생각해봐. 감각 힐링.", tip:"향수마다 메모 남겨두면 나중에 고를 때 편해.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:116,name:"스트레칭 루틴 만들기",emoji:"🤸", time:20,  genre:"fitness", vibe:["소리지르고싶어","웃음","같이하면더좋은","기분전환"], hint:"내 몸에 맞는 루틴 하나 만들면 매일 써먹을 수 있어.", tip:"유튜브 스트레칭 영상 몇 개 보고 내가 좋아하는 동작만 골라봐.", tags:{ energy:["low","mid"], need:["성취감","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:117,name:"책상 위 사진 정리",  emoji:"🗂️",  time:20,  genre:"tidy", vibe:["웃음","집중","같이하면더좋은","기분전환"],    hint:"책상이 깔끔해지면 집중력이 달라져. 5분 투자 효과 큰 거 중 하나.", tip:"자주 쓰는 것만 책상 위에. 나머지는 서랍 속.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:118,name:"좋아하는 작가 신작 탐색",emoji:"📚",time:20,genre:"culture", vibe:["두근거림","집중","도전","같이하면더좋은","짜릿함"], hint:"좋아하는 작가의 새 책 나왔는지 확인하는 게 소소한 기대감을 줘.", tip:"교보문고나 알라딘 앱에서 관심 작가 팔로우 해두면 알림 와.", tags:{ energy:["low"], need:["자극","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:119,name:"집에서 혼자 술 한 잔",emoji:"🍷", time:40,  genre:"healing", vibe:["집중","웃음","같이하면더좋은","기분전환"], hint:"아무도 신경 안 써도 되는 혼술이 제일 편해. 내 페이스대로.", tip:"좋아하는 안주 하나만 있으면 충분해. BGM 골라서 분위기 만들어봐.", tags:{ energy:["low","mid"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:120,name:"입술 / 손 관리",     emoji:"💅",  time:20,  genre:"healing", vibe:["두근거림","새로운경험","특별한경험","짜릿함"], hint:"10분만 투자해도 손이 달라 보여. 작은 자기관리가 기분 업시켜줘.", tip:"핸드크림 + 큐티클 오일만 있으면 충분해. 마스크팩이랑 같이 하면 더 좋아.", tags:{ energy:["low"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:121,name:"마스크팩 하면서 누워있기",emoji:"🧖",time:20,genre:"healing", vibe:["혼자만의시간","소소한사치","야간감성","충전"],hint:"15분 타이머 맞추고 그냥 누워있으면 돼. 핑계가 생기는 거야.", tip:"냉장고에 넣어뒀다가 쓰면 더 시원하고 좋아.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:122,name:"좋아하는 연예인 영상 탐방",emoji:"⭐",time:30,genre:"culture", vibe:["따뜻함","고요함","충전","혼자만의시간"],hint:"팬심 충전하는 시간. 짧게 즐기기 딱 좋아.", tip:"유튜브 자막 영상이나 비하인드 영상 추천. 안 본 거 있으면 금광 찾은 거야.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:123,name:"가계부 정리",        emoji:"📊",  time:20,  genre:"tidy", vibe:["자연감성","따뜻함","충전","기분전환"],    hint:"돈 어디 썼는지 알면 다음에 더 잘 쓸 수 있어. 앎에서 오는 안도감.", tip:"뱅크샐러드나 토스 앱 쓰면 자동으로 정리돼 있어. 확인만 해도 됨.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:124,name:"위시리스트 업데이트", emoji:"🛒",  time:15,  genre:"digital", vibe:["뿌듯함","따뜻함","완성하는기쁨"], hint:"사고 싶은 거 구경만 해도 기분이 좋아져. 실제로 안 사도 됨.", tip:"쿠팡이나 무신사 찜 목록 정리해봐. 진짜 사고 싶은 거 추려지는 게 보여.", tags:{ energy:["low"], need:["자극","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:125,name:"오늘 날씨에 맞는 옷 코디",emoji:"👗",time:15,genre:"art", vibe:["뿌듯함","따뜻함","완성하는기쁨","소소한사치"],    hint:"내일 입을 옷 미리 정해두면 아침이 편해. 코디 맞추는 것 자체가 소소한 재미.", tip:"날씨앱 확인하고 실제로 입어봐. 안 입던 조합 도전해봐.", tags:{ energy:["low","mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:126,name:"좋아하는 팟캐스트 새 에피소드",emoji:"🎙️",time:40,genre:"culture", vibe:["자연감성","자유로움","같이하면더좋은","특별한경험","기분전환"],hint:"구독한 채널 새 에피소드 확인하는 게 소소한 기대감이야.", tip:"걸으면서 듣거나 집안일 하면서 틀어놔봐. 멍때리기랑 동시에 가능.", tags:{ energy:["low"], need:["멍때리기","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:127,name:"구독 유튜브 몰아보기",emoji:"📺",  time:60,  genre:"culture", vibe:["자유로움","자연감성","혼자만의시간","리셋"], hint:"밀린 거 한번에 보면서 따라잡는 느낌. 숙제 하나 끝낸 것 같기도 함.", tip:"1.5배속으로 놓고 봐. 시간 절약되면서 내용은 다 들어와.", tags:{ energy:["low"], need:["멍때리기"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:128,name:"손 편지 써보기",      emoji:"✉️",  time:30,  genre:"art", vibe:["도전","자연감성","자유로움","뿌듯함","짜릿함"],     hint:"누군가한테 직접 쓰는 편지는 디지털이 절대 못 대체하는 온도가 있어.", tip:"보내도 되고 안 보내도 돼. 쓰는 것 자체가 이미 힐링이야.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:129,name:"좋아하는 공간 인테리어 탐색",emoji:"🏠",time:20,genre:"digital", vibe:["특별한경험","야간감성","도전","자연감성","짜릿함"],hint:"언젠가 내 공간 꾸밀 때 쓸 레퍼런스 모으는 재미가 있어.", tip:"핀터레스트나 인스타에서 원하는 분위기 키워드 검색해봐.", tags:{ energy:["low"], need:["자극","힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:130,name:"냉장고 정리",         emoji:"🧊",  time:20,  genre:"tidy", vibe:["혼자만의시간","자연감성","자유로움","리셋","충전"],    hint:"유통기한 확인하면서 정리하면 식재료 낭비도 줄어. 뿌듯함 있어.", tip:"자주 쓰는 거 앞에. 안 쓰는 거 버려. 깔끔해진 냉장고 보면 기분 좋아.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},

  // ── 야외 사소한 것들 ──
  { id:131,name:"동네 뒷골목 탐험",   emoji:"🗺️",  time:40,  genre:"travel", vibe:["고요함","아무생각없이","야간감성","자연감성","충전"],  hint:"매일 다니는 길 옆 골목 한번 들어가봐. 의외로 모르는 게 많아.", tip:"목적지 없이 그냥 걸어봐. 지도 보지 말고.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자"], cost:["무료"] }},
  { id:132,name:"공원 벤치에서 멍때리기",emoji:"🌳",time:30,genre:"nature", vibe:["기대감","간단하게","뿌듯함","혼자만의시간"],   hint:"바깥 공기 마시면서 아무것도 안 하는 거야. 집에서 멍때리는 것보다 더 비워져.", tip:"이어폰 없이 가봐. 주변 소리 듣다 보면 생각이 느려져.", tags:{ energy:["low","mid"], need:["힐링","멍때리기"], location:["out"], alone:["혼자"], cost:["무료"] }},
  { id:133,name:"새벽 편의점 산책",    emoji:"🌙",  time:30,  genre:"travel", vibe:["기대감","뿌듯함","정리정돈","혼자만의시간"],  hint:"새벽 편의점 특유의 고요함이 있어. 낮이랑 완전 다른 공기야.", tip:"야식 사먹어도 되고 그냥 구경만 해도 돼.", tags:{ energy:["low","mid"], need:["힐링","자극"], location:["out"], alone:["혼자"], cost:["무료","조금"] }},
  { id:134,name:"꽃집 구경",           emoji:"🌸",  time:20,  genre:"travel", vibe:["감성충전","뿌듯함","특별한경험","소소한사치"],  hint:"꽃 한 다발 사지 않아도 돼. 보는 것만으로도 기분 환기가 돼.", tip:"꽃집 아줌마한테 오늘 제일 예쁜 거 뭐냐고 물어봐봐.", tags:{ energy:["low","mid"], need:["힐링"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},
  { id:135,name:"버스 종점까지 타보기",emoji:"🚌",  time:60,  genre:"travel", vibe:["지적자극","뿌듯함","도전","완성하는기쁨"],  hint:"목적지 없이 버스 타고 끝까지 가봐. 낯선 동네에 내려지는 느낌이 묘해.", tip:"스마트폰 들고 가서 구경하다가 카페 들어가도 되고 그냥 돌아와도 돼.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자"], cost:["무료","조금"] }},
  { id:136,name:"마트 구경",           emoji:"🛒",  time:30,  genre:"travel", vibe:["지적자극","집중","도전","완성하는기쁨"],  hint:"살 거 없어도 돼. 신상 식품 구경하는 게 소소하게 재밌어.", tip:"B1 식품코너에서 모르는 재료 하나 골라봐. 집에서 뭔가 만들고 싶어져.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자"], cost:["무료"] }},
  { id:137,name:"동네 떡볶이 먹기",    emoji:"🌶️",  time:30,  genre:"cooking", vibe:["뿌듯함","간단하게","도전","짜릿함"], hint:"포장마차나 분식집 떡볶이는 집에서 못 만드는 그 맛이 있어.", tip:"혼자도 전혀 이상하지 않아. 서서 먹는 게 더 맛있어.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:138,name:"해질녘 한강 산책",    emoji:"🌇",  time:60,  genre:"nature", vibe:["지적자극","간단하게","혼자만의시간"],  hint:"한강 바람이랑 노을 조합이 최고야. 머릿속이 넓어지는 느낌.", tip:"치맥 사들고 가도 되고 그냥 걸어도 충분해.", tags:{ energy:["mid"], need:["힐링"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},
  { id:139,name:"동네 산 짧게 오르기", emoji:"⛰️",  time:60,  genre:"mountain", vibe:["집중","도전","뿌듯함","짜릿함"],hint:"풀코스 등산 아니어도 돼. 30분만 올라갔다 내려와도 개운해.", tip:"운동화만 있으면 돼. 중턱에서 경치 보고 내려오는 것도 충분.", tags:{ energy:["mid"], need:["성취감","힐링"], location:["out"], alone:["혼자"], cost:["무료"] }},
  { id:140,name:"카페 혼자 작업",      emoji:"💻",  time:90,  genre:"digital", vibe:["수동적소비","지적자극","자연감성","혼자만의시간"], hint:"집에서 집중 안 되면 환경을 바꿔봐. 카페 소음이 오히려 집중 도와줘.", tip:"이어폰 끼지 말고 카페 소리 그대로 들으면서 해봐. 효과 있어.", tags:{ energy:["mid"], need:["성취감","자극"], location:["out"], alone:["혼자"], cost:["조금"] }},

  // ── 밤 특화 ──
  { id:141,name:"야식 시켜먹기",       emoji:"🛵",  time:30,  genre:"cooking", vibe:["지적자극","간단하게","뿌듯함","도전"], hint:"오늘 하루 수고했으니까 그냥 시켜먹어. 죄책감 없이.", tip:"평소 먹던 거 말고 새로운 집 한번 시도해봐.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:142,name:"새벽 드라이브",       emoji:"🌙",  time:60,  genre:"travel", vibe:["소소한사치","뿌듯함","집중","충전"],  hint:"새벽 도로는 낮이랑 완전 달라. 아무도 없는 도시를 달리는 느낌.", tip:"좋아하는 플레이리스트 틀고 그냥 달려봐. 목적지 필요 없어.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:143,name:"밤에 혼자 라면",      emoji:"🍜",  time:15,  genre:"cooking", vibe:["따뜻함","몸회복","간단하게","충전"], hint:"밤 11시 라면은 낮이랑 맛이 달라. 이유는 모르겠지만 진짜야.", tip:"면 살짝 덜 익혀서 먹어봐. 식감이 달라져.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:144,name:"자기 전 스트레칭",    emoji:"🌙",  time:10,  genre:"healing", vibe:["뿌듯함","몸회복","소소한사치","충전"], hint:"자기 전 5분 스트레칭이 수면의 질을 바꿔줘. 몸이 이완되면 뇌도 쉬어.", tip:"유튜브 '취침 전 스트레칭' 검색. 누워서 하는 것도 있어.", tags:{ energy:["low"], need:["힐링"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:145,name:"밤에 일기 쓰기",      emoji:"📝",  time:15,  genre:"art", vibe:["따뜻함","소소한사치","혼자만의시간","충전"],     hint:"하루 끝에 정리하면 내일이 가벼워져. 오늘 좋았던 거 세 개만 써봐.", tip:"잘 쓰려고 하지 마. 단어만 써도 됨.", tags:{ energy:["low"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},

  // ── 아침 특화 ──
  { id:146,name:"모닝 커피 루틴",      emoji:"☀️",  time:15,  genre:"cooking", vibe:["소소한사치","뿌듯함","특별한경험","기분전환"], hint:"하루 시작을 커피 한 잔으로 여는 의식. 천천히 마시는 그 시간이 하루를 세팅해.", tip:"핸드폰 보지 말고 커피만 마셔봐. 5분만이라도.", tags:{ energy:["low","mid"], need:["힐링"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:147,name:"아침 산책",           emoji:"🌅",  time:30,  genre:"nature", vibe:["따뜻함","소소한사치","몸회복","충전"],  hint:"아침 공기가 달라. 조용한 동네를 혼자 걷는 게 하루를 다르게 시작하게 해.", tip:"이어폰 빼고 가봐. 새 소리 들리면 그날 하루가 좀 달라.", tags:{ energy:["mid"], need:["힐링"], location:["out"], alone:["혼자"], cost:["무료"] }},
  { id:148,name:"브런치 카페 가기",    emoji:"🥞",  time:60,  genre:"cooking", vibe:["따뜻함","몸회복","아무생각없이","충전"], hint:"주말 아침 브런치는 소소한 사치야. 평일과 다른 리듬을 만들어줘.", tip:"혼자 가도 돼. 책 한 권 들고 가면 더 완벽해.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},

  // ── 겨울 특화 ──
  { id:149,name:"따뜻한 음료 만들어 마시기",emoji:"🍵",time:20,genre:"cooking", vibe:["몸회복","따뜻함","고요함","충전"],hint:"손으로 감싸는 그 따뜻함이 마음까지 녹여줘.", tip:"루이보스, 캐모마일, 유자차 — 카페인 없는 거로 저녁에 마셔봐.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:150,name:"눈 오는 날 산책",     emoji:"❄️",  time:30,  genre:"nature", vibe:["아무생각없이","고요함","충전"],  hint:"눈 밟는 소리랑 하얀 세상이 주는 조용함이 특별해.", tip:"장갑이랑 목도리만 챙기면 돼. 발자국 찍는 것만으로도 기분 좋아.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["무료"] }},

  // ── CAMP ──
  { id:151,name:"오토캠핑",            emoji:"🚗",  time:480, genre:"camp", vibe:["따뜻함","고요함","특별한경험","충전"],    hint:"차에서 짐 내리면 끝. 준비 최소화하면서 자연 속에 있을 수 있어.", tip:"캠핑장 예약은 최소 2주 전. 화로대랑 타프만 있으면 충분해.", tags:{ energy:["mid","high"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:152,name:"차박",                emoji:"🚙",  time:480, genre:"camp", vibe:["수동적소비","아무생각없이","혼자만의시간","웃음"],    hint:"차 안에서 자는 게 생각보다 아늑해. 준비가 가장 적고 자유도가 높아.", tip:"에어 매트리스 하나면 충분. 바다나 강변 근처 차박 성지 검색해봐.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["무료","조금"] }},
  { id:153,name:"백패킹",              emoji:"🎒",  time:480, genre:"camp", vibe:["집중","아무생각없이","짜릿함","도전"],    hint:"내 등에 집을 지고 산속으로 들어가는 거야. 가장 원초적인 자유.", tip:"배낭 무게는 체중의 20% 이하가 적당. 지리산, 설악산 백패킹 코스 추천.", tags:{ energy:["high"], need:["성취감","자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:154,name:"비박",                emoji:"🌌",  time:480, genre:"camp", vibe:["두근거림","새로운경험","웃음","짜릿함"],    hint:"텐트 없이 별 보면서 자는 거야. 세상에서 제일 큰 지붕 아래.", tip:"비박용 쉘터나 타프 하나면 돼. 날씨 확인 필수. 경험자랑 처음엔 같이 가봐.", tags:{ energy:["high"], need:["자극","힐링"], location:["out"], alone:["같이"], cost:["조금"] }},
  { id:155,name:"솔로캠핑",            emoji:"🔥",  time:480, genre:"camp", vibe:["집중","완성하는기쁨","뿌듯함","고요함","혼자만의시간"],    hint:"혼자라서 더 자유로워. 내 페이스대로 먹고 자고 불 피우면 돼.", tip:"처음엔 사람 많은 캠핑장에서 솔캠 시작해봐. 안전하고 외롭지 않아.", tags:{ energy:["mid","high"], need:["힐링","성취감"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:156,name:"불멍",                emoji:"🔥",  time:120, genre:"camp", vibe:["집중","완성하는기쁨","뿌듯함","혼자만의시간"],    hint:"불 보고 있으면 시간이 어떻게 가는지 몰라. 진짜 아무 생각 없어지는 시간.", tip:"화로대 + 장작만 있으면 돼. 집 베란다도 되는지 확인하고.", tags:{ energy:["low","mid"], need:["힐링","멍때리기"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:157,name:"캠핑 메뉴 계획 짜기", emoji:"📋",  time:30,  genre:"camp", vibe:["땀흘리기","리셋","야간감성","충전"],    hint:"뭐 해먹을지 짜는 것만으로 설레. 장 보기 전 기대감이 제일 좋아.", tip:"캠핑 요리 유튜브 보면서 짜봐. 불닭, 스테이크, 더치오븐 요리 추천.", tags:{ energy:["low","mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:158,name:"캠핑 장비 손질",      emoji:"🧰",  time:45,  genre:"camp", vibe:["땀흘리기","리셋","간단하게","충전"],    hint:"장비 닦고 정리하면서 다음 캠핑 기대감이 생겨. 애착이 더 생기는 시간.", tip:"텐트 건조 확인, 랜턴 배터리 체크, 가스 잔량 확인. 30분이면 충분.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:159,name:"감성캠핑 세팅",       emoji:"🏮",  time:180, genre:"camp", vibe:["간단하게","땀흘리기","뿌듯함","충전"],    hint:"조명이랑 소품 배치하는 게 인테리어 하는 것 같아. 사진도 예쁘게 나와.", tip:"페어리라이트, 랜턴, 러그만 있어도 분위기 완전 달라져.", tags:{ energy:["mid","high"], need:["성취감","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},

  // ── LEARN ──
  { id:160,name:"클래스101 강의",      emoji:"🎓",  time:60,  genre:"learn", vibe:["간단하게","땀흘리기","뿌듯함","충전"],   hint:"관심 있던 거 배우는 30분이 유튜브 보는 2시간보다 기억에 남아.", tip:"첫 달 할인 많아. 드로잉, 글쓰기, 투자, 요리 중 하나 골라봐.", tags:{ energy:["mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:161,name:"유데미 / 인프런 강의", emoji:"💡",  time:90,  genre:"learn", vibe:["소소한사치","맛탐험","기분전환","같이하면더좋은"],   hint:"실무 기술 하나 배우면 자존감이 달라져. 완강 못 해도 괜찮아.", tip:"할인할 때 사두고 조금씩 들어봐. 1강만 들어도 오늘 뭔가 한 거야.", tags:{ energy:["mid","high"], need:["성취감"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:162,name:"듀오링고 언어 공부",  emoji:"🦜",  time:15,  genre:"learn", vibe:["소소한사치","맛탐험","따뜻함","기분전환"],   hint:"15분만 해도 됨. 스트릭 유지하는 게 의외로 중독성 있어.", tip:"일본어, 스페인어, 영어 중 하나 골라봐. 게임 같아서 부담 없어.", tags:{ energy:["low","mid"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:163,name:"책 요약 앱 (밀리)",   emoji:"📖",  time:20,  genre:"learn", vibe:["소소한사치","맛탐험","기분전환","혼자만의시간"],   hint:"책 한 권 다 읽기 부담스러우면 요약본만 봐도 돼. 핵심은 다 있어.", tip:"밀리의서재 오디오북으로 들으면 이동 중에도 가능.", tags:{ energy:["low","mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:164,name:"자격증 공부",         emoji:"📝",  time:60,  genre:"learn", vibe:["소소한사치","맛탐험","기분전환","혼자만의시간"],   hint:"한 챕터만 해도 됨. 조금씩 쌓이는 게 나중에 큰 차이가 돼.", tip:"큐넷에서 원하는 자격증 찾아봐. 생각보다 종류 많아.", tags:{ energy:["mid","high"], need:["성취감"], location:["home"], alone:["혼자"], cost:["무료","조금"] }},
  { id:165,name:"유튜브 다큐 보기",    emoji:"🎥",  time:60,  genre:"learn", vibe:["소소한사치","맛탐험","같이하면더좋은","야간감성"],   hint:"지식 얻으면서 멍때리기 동시에 가능. 자연 다큐가 제일 힐링이야.", tip:"BBC Earth, 내셔널지오그래픽 한국어 채널 추천.", tags:{ energy:["low","mid"], need:["힐링","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},
  { id:166,name:"영어 뉴스 듣기",      emoji:"📰",  time:20,  genre:"learn", vibe:["소소한사치","도전","맛탐험","짜릿함"],   hint:"CNN이나 BBC 10분만 들어도 영어 귀가 뚫리는 느낌이야.", tip:"유튜브 CNN10 추천. 10분짜리라 부담 없어. 자막 켜고 봐봐.", tags:{ energy:["mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},

  // ── BEAUTY ──
  { id:167,name:"셀프 네일",           emoji:"💅",  time:60,  genre:"beauty", vibe:["소소한사치","뿌듯함","몸회복"],  hint:"손만 예뻐져도 기분이 달라져. 내 손 보면서 하루 종일 기분 좋아.", tip:"베이스코트 → 컬러 2번 → 탑코트 순서. 젤 네일은 UV 램프 필요.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:168,name:"헤어팩 / 트리트먼트", emoji:"💆",  time:30,  genre:"beauty", vibe:["소소한사치","뿌듯함","몸회복"],  hint:"머리카락이 부드러워지면 기분도 같이 부드러워져.", tip:"팩 바르고 샤워캡 쓰고 15분. 드라이기 따뜻한 바람 쬐면 더 흡수 잘 돼.", tags:{ energy:["low"], need:["힐링"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:169,name:"피부 관리 루틴",      emoji:"🧴",  time:20,  genre:"beauty", vibe:["소소한사치","뿌듯함","몸회복"],  hint:"클렌징부터 수분크림까지 제대로 하면 피부가 달라지는 게 보여.", tip:"스팀타월로 모공 열어주고 시작하면 흡수가 달라.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:170,name:"홈 스파",             emoji:"🛁",  time:60,  genre:"beauty", vibe:["소소한사치","뿌듯함","몸회복"],  hint:"마스크팩 + 족욕 + 아로마 동시에. 집에서 스파 수준 가능해.", tip:"욕실 조명 낮추고 캔들 켜면 분위기 완성. 좋아하는 음악도 틀어봐.", tags:{ energy:["low"], need:["힐링"], location:["home"], alone:["혼자"], cost:["조금"] }},
  { id:171,name:"네일샵 가기",         emoji:"✨",  time:90,  genre:"beauty", vibe:["소소한사치","뿌듯함","몸회복"],  hint:"내 손 예쁘게 만들어주는 시간. 앉아서 쉬면서 예뻐지는 거잖아.", tip:"젤 네일 3~4주 유지. 가기 전에 원하는 디자인 사진 저장해가봐.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:172,name:"헤어샵 / 두피케어",   emoji:"💇",  time:90,  genre:"beauty", vibe:["소소한사치","뿌듯함","몸회복"],  hint:"머리 감겨주는 그 시간이 세상에서 제일 편해. 두피 마사지는 천국이야.", tip:"두피 스케일링 한 번 받아봐. 머리카락이 달라진 느낌.", tags:{ energy:["low","mid"], need:["힐링"], location:["out"], alone:["혼자"], cost:["조금","상관없어"] }},

  // ── RELAX ──
  { id:173,name:"찜질방",              emoji:"🔴",  time:180, genre:"relax", vibe:["따뜻함","몸회복","고요함"],   hint:"뜨거운 방에서 땀 빼고 나오면 몸이 새것 같아. 정신도 같이 리셋돼.", tip:"계란이랑 식혜는 필수. 고수면 불가마까지 도전해봐.", tags:{ energy:["low","mid"], need:["힐링","멍때리기"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:174,name:"마사지샵",            emoji:"💆",  time:60,  genre:"relax", vibe:["따뜻함","몸회복","고요함"],   hint:"전문가 손길이 다르긴 달라. 뭉친 근육 풀리는 그 느낌이 중독성 있어.", tip:"타이마사지나 스웨디시 추천. 첫 방문 할인 쿠폰 찾아봐.", tags:{ energy:["low","mid"], need:["힐링"], location:["out"], alone:["혼자"], cost:["조금","상관없어"] }},
  { id:175,name:"수면 카페",           emoji:"😴",  time:60,  genre:"relax", vibe:["따뜻함","몸회복","고요함"],   hint:"낮잠 자러 카페 가는 거야. 진짜 있어. 침대나 캡슐에서 자고 나옴.", tip:"강남, 홍대 수면 카페 검색해봐. 1시간 단위 예약.", tags:{ energy:["low"], need:["힐링"], location:["out"], alone:["혼자"], cost:["조금"] }},
  { id:176,name:"플로팅 테라피",       emoji:"🌊",  time:90,  genre:"relax", vibe:["따뜻함","몸회복","고요함"],   hint:"소금물 위에 둥둥 뜨는 거야. 소리도 빛도 없는 완전한 고요함.", tip:"1시간짜리 세션 하나로 충분. 처음엔 좀 어색하지만 10분 지나면 완전 릴렉스.", tags:{ energy:["low"], need:["힐링","멍때리기"], location:["out"], alone:["혼자"], cost:["상관없어"] }},

  // ── GAME ──
  { id:177,name:"닌텐도 스위치",       emoji:"🎮",  time:60,  genre:"game", vibe:["집중","웃음","혼자만의시간"],    hint:"혼자도 재밌고 같이도 재밌어. 마리오카트는 우정파괴자임.", tip:"모여봐요 동물의숲, 젤다, 스플래툰 추천. 장르 다양해.", tags:{ energy:["low","mid"], need:["자극","멍때리기"], location:["home"], alone:["혼자","같이"], cost:["무료"] }},
  { id:178,name:"PC방",                emoji:"🖥️",  time:120, genre:"game", vibe:["집중","웃음","혼자만의시간"],    hint:"집이랑 다른 고사양 환경이야. 집에서 못 돌리는 게임도 돌아가.", tip:"조용한 시간대 가면 자리도 잘 나고 여유로워.", tags:{ energy:["mid"], need:["자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:179,name:"아케이드 게임센터",   emoji:"🕹️",  time:60,  genre:"game", vibe:["집중","웃음","혼자만의시간"],    hint:"오락실 특유의 소음이랑 빛이 묘하게 에너지를 줘. 레트로 감성도 있어.", tip:"리듬게임, 클로버, 인형뽑기 다 있어. 동전 5천원이면 한참 놀아.", tags:{ energy:["mid","high"], need:["자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:180,name:"퍼즐 맞추기",         emoji:"🧩",  time:90,  genre:"game", vibe:["집중","웃음","혼자만의시간"],    hint:"조각 하나씩 맞춰가는 과정이 명상이야. 완성될수록 집중도가 올라가.", tip:"500피스부터 시작해봐. 다이소에 있어. 완성하면 액자에 넣어도 돼.", tags:{ energy:["low","mid"], need:["힐링","성취감"], location:["home"], alone:["혼자","같이"], cost:["조금"] }},
  { id:181,name:"보드게임 혼자 하기",  emoji:"♟️",  time:45,  genre:"game", vibe:["집중","웃음","혼자만의시간"],    hint:"1인용 보드게임이 꽤 많아. 퍼즐형이나 덱빌딩 장르 추천.", tip:"솔로 모드 있는 보드게임 찾아봐. 글룸헤이븐, 팬데믹 추천.", tags:{ energy:["mid"], need:["성취감","자극"], location:["home"], alone:["혼자"], cost:["무료"] }},

  // ── MOVE ──
  { id:182,name:"야간 조깅",           emoji:"🌙",  time:30,  genre:"move", vibe:["땀흘리기","리셋","기분전환"],    hint:"밤 공기 마시면서 달리면 낮이랑 느낌이 달라. 도시가 조용해서 더 좋아.", tip:"안전한 공원이나 한강변 추천. 야광 조끼나 밝은 옷 입어봐.", tags:{ energy:["mid","high"], need:["자극","성취감"], location:["out"], alone:["혼자"], cost:["무료"] }},
  { id:183,name:"파워워크",            emoji:"🚶",  time:40,  genre:"move", vibe:["땀흘리기","리셋","기분전환"],    hint:"빠르게 걷는 게 조깅보다 관절 부담 없으면서 효과는 비슷해.", tip:"팔 크게 흔들고 보폭 넓게. 이어폰 끼고 좋아하는 거 들으면 시간 빨리 가.", tags:{ energy:["mid"], need:["힐링","성취감"], location:["out"], alone:["혼자"], cost:["무료"] }},
  { id:184,name:"줄넘기",              emoji:"🪢",  time:15,  genre:"move", vibe:["땀흘리기","리셋","기분전환"],    hint:"10분만 해도 땀이 나. 장소 안 가리고 줄 하나면 어디서든 가능.", tip:"한 세트 100개 목표로 시작해봐. 음악 틀어놓고 하면 더 재밌어.", tags:{ energy:["mid","high"], need:["성취감","자극"], location:["home","out"], alone:["혼자"], cost:["무료"] }},
  { id:185,name:"계단 오르기",         emoji:"🪜",  time:20,  genre:"move", vibe:["땀흘리기","리셋","기분전환"],    hint:"엘리베이터 대신 계단. 10층만 올라도 운동이 돼. 어디서든 가능.", tip:"아파트 꼭대기까지 올라갔다 내려와봐. 생각보다 힘들어.", tags:{ energy:["mid"], need:["성취감"], location:["out"], alone:["혼자"], cost:["무료"] }},

  // ── FOOD ──
  { id:186,name:"야시장 / 푸드트럭",   emoji:"🌮",  time:60,  genre:"food", vibe:["소소한사치","맛탐험","기분전환"],    hint:"다양한 음식 조금씩 먹는 게 재밌어. 뭘 먹을지 구경하는 것도 즐거움.", tip:"홍대, 강남, 여의도 한강공원 푸드트럭 많아. 주말 저녁이 제일 많이 열려.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:187,name:"전통시장 구경",        emoji:"🏪",  time:60,  genre:"food", vibe:["소소한사치","맛탐험","기분전환"],    hint:"마트에 없는 게 시장에 있어. 사람 사는 냄새가 나는 곳이야.", tip:"광장시장, 남대문, 동네 재래시장 추천. 어묵이랑 순대 사먹는 게 국룰.", tags:{ energy:["mid"], need:["자극","힐링"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:188,name:"동네 빵집 탐방",      emoji:"🥐",  time:30,  genre:"food", vibe:["소소한사치","맛탐험","기분전환"],    hint:"체인점이 아닌 동네 빵집은 메뉴가 다 달라. 발견하는 재미가 있어.", tip:"구글맵에서 '베이커리' 검색하면 숨은 맛집 나와. 오전에 가야 신선해.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:189,name:"디저트 카페 투어",    emoji:"🍰",  time:90,  genre:"food", vibe:["소소한사치","맛탐험","기분전환"],    hint:"예쁜 케이크 보는 것만으로도 기분 좋아져. 먹으면 더 좋고.", tip:"인스타에서 동네 디저트 카페 검색해봐. 숨어있는 맛집 많아.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금"] }},
  { id:190,name:"칵테일바 / 와인바",   emoji:"🍸",  time:120, genre:"food", vibe:["소소한사치","맛탐험","기분전환"],    hint:"술 자체보다 공간이랑 분위기가 달라. 바텐더랑 대화하는 것도 재밌어.", tip:"혼바도 전혀 이상하지 않아. 카운터 자리 앉으면 대화 자연스럽게 돼.", tags:{ energy:["mid"], need:["힐링","자극"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
  { id:191,name:"맛집 오픈런",         emoji:"⏰",  time:120, genre:"food", vibe:["소소한사치","맛탐험","기분전환"],    hint:"줄 서는 시간도 기대감의 일부야. 들어가서 먹었을 때 보람이 달라.", tip:"웨이팅 앱 써봐. 실시간 대기 순서 확인 가능한 곳 많아.", tags:{ energy:["mid","high"], need:["자극","성취감"], location:["out"], alone:["혼자","같이"], cost:["조금","상관없어"] }},
];

// ─── 질문 구조 ────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "need", section: "지금 상태", label: "지금 기분이 어때?",
    options: [
      { value:"힐링", label:"🌿 지쳐서 쉬고 싶어", subLabel:"어떻게 쉬고 싶어?", maxSubs:2, subs:[
        { value:"고요함", label:"조용히 아무것도 안 하고 싶어" },
        { value:"따뜻함", label:"따뜻하거나 감각적인 게 필요해" },
        { value:"감성충전", label:"감성적인 걸 보거나 듣고 싶어" },
        { value:"몸회복", label:"몸이 피곤해서 회복이 필요해" },
      ]},
      { value:"성취감", label:"🏆 뭔가 해내고 싶어", subLabel:"어떤 성취?", maxSubs:2, subs:[
        { value:"정리정돈", label:"지저분한 걸 정리하고 싶어" },
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
        { value:"기다리는맛", label:"혼자 조용히 기다리는 게 좋아 (낚시 등)" },
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




// ─── 매칭 로직 ────────────────────────────────────────────
function matchActivities(answers) {
  const allSubs = Object.values(answers.subs || {}).flat();
  const togetherWith = (answers.subs?.alone || [])[0];

  const togetherGenreBonus = {
    친구:  ["social","sport","game","food","travel"],
    연인:  ["culture","travel","nature","food","craft","relax"],
    가족:  ["nature","food","camp","culture","cooking"],
    동료:  ["social","sport","food","game"],
  };

  return ACTIVITIES.map(act => {
    let score = 0;
    const t = act.tags;

    // 하드 필터
    if (answers.location === "home" && !t.location.includes("home")) return null;
    if (answers.alone === "혼자"    && t.alone.length === 1 && t.alone[0] === "같이") return null;
    if (answers.alone === "같이"    && t.alone.length === 1 && (t.alone[0] === "혼자" || t.alone[0] === "강아지랑")) return null;
    if (answers.alone === "강아지랑" && !t.alone.includes("강아지랑") && !t.alone.includes("혼자")) return null;
    if (act.time > answers.hours * 60) return null;
    if (answers.cost === "무료" && !t.cost.includes("무료")) return null;
    if (answers.blacklistGenres?.includes(act.genre)) return null;
    const fishingIds = [70,71,72,73];
    const waterSportIds = [74,75,76,77,78,79,80];
    if (answers.blacklistGenres?.includes("fishing") && fishingIds.includes(act.id)) return null;
    if (answers.blacklistGenres?.includes("watersport") && waterSportIds.includes(act.id)) return null;

    // 기본 스코어
    if (answers.need && t.need.includes(answers.need)) score += 5;
    if (t.location.includes(answers.location)) score += 2;
    if (answers.cost && t.cost.includes(answers.cost)) score += 1;

    // 같이 모드 보너스
    if (answers.alone === "같이" && togetherWith) {
      if (togetherGenreBonus[togetherWith]?.includes(act.genre)) score += 3;
    }

    // vibe 직접 매칭 — 서브 선택값이 활동 vibe와 일치할 때
    if (allSubs.length && act.vibe?.length) {
      const vibeHits = allSubs.filter(s => act.vibe.includes(s)).length;
      score += vibeHits * 3;
    }

    // 온보딩 선호 vibe 보너스
    if (answers.preferredVibes?.length && act.vibe?.length) {
      const prefHits = answers.preferredVibes.filter(v => act.vibe.includes(v)).length;
      score += prefHits * 4;
    }

    // 추천 이유 생성
    const matchedVibes = [...allSubs, ...(answers.preferredVibes || [])]
      .filter(v => act.vibe?.includes(v));
    const VIBE_KO = {
      고요함:"고요함",따뜻함:"따뜻함",아무생각없이:"아무 생각 없이",느리게:"천천히",몸회복:"몸 회복",
      감성충전:"감성 충전",수동적소비:"수동적 소비",혼자만의시간:"혼자만의 시간",
      뿌듯함:"뿌듯함",완성하는기쁨:"완성의 기쁨",지적자극:"지적 자극",정리정돈:"정리정돈",
      두근거림:"두근거림",새로운경험:"새로운 경험",도전:"도전",웃음:"웃음",
      자연감성:"자연 감성",기다리는맛:"기다리는 맛",야간감성:"밤 감성",자유로움:"자유로움",
      소소한사치:"소소한 사치",집중:"집중",땀흘리기:"땀 흘리기",같이하면더좋은:"함께",
      맛탐험:"맛 탐험",따뜻함:"따뜻함",충전:"충전",비우는기쁨:"비우는 기쁨",리셋:"리셋",
    };
    const reasonParts = [...new Set(matchedVibes.slice(0,2))].map(v => VIBE_KO[v] || v);
    const reason = reasonParts.length
      ? `네가 ${reasonParts.join(" + ")} 고른 거랑 잘 맞아`
      : answers.need === "멍때리기" ? "뭔가 틀어놓기만 해도 되는 거야"
      : answers.need === "성취감" ? "오늘 뭔가 해낸 느낌 줄 수 있어"
      : "지금 네 상태에 잘 맞는 것 같아";

    return { ...act, score, reason };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}


// ─── 일정 순서 로직 ──────────────────────────────────────
function getTimeSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

function getActivityWeight(act) {
  let w = 0;
  if (act.tags.energy.includes("high")) w += 3;
  else if (act.tags.energy.includes("mid")) w += 2;
  else w += 1;
  const activeGenres = ["water","mountain","sport","fitness","cycling"];
  if (activeGenres.includes(act.genre)) w += 2;
  if (act.tags.need?.includes("성취감")) w += 1;
  return w;
}

function getCategory(act) {
  if (act.tags.need?.includes("성취감")) return "productive";
  if (act.tags.need?.includes("자극")) return "stimulate";
  if (act.tags.need?.includes("멍때리기")) return "passive";
  return "healing";
}

function sortSchedule(items, timeSlot) {
  return [...items].sort((a, b) => {
    const wa = getActivityWeight(a);
    const wb = getActivityWeight(b);
    if (timeSlot === "night") {
      if (a.tags.location.includes("out") && !b.tags.location.includes("out")) return 1;
      if (!a.tags.location.includes("out") && b.tags.location.includes("out")) return -1;
    }
    if (timeSlot === "evening") {
      const foodA = a.genre === "cooking";
      const foodB = b.genre === "cooking";
      if (foodA && !foodB) return -1;
      if (!foodA && foodB) return 1;
    }
    return wb - wa;
  });
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export default function VibeApp() {
  const [screen, setScreen] = useState("onboarding"); // onboarding | setup | tournament | result
  const [answers, setAnswers] = useState({ need:"", alone:"", location:"", cost:"", hours:2, subs:{}, preferredVibes:[], blacklistGenres:[] });
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: 좋아하는 vibe, 1: 블랙리스트
  const [tempVibes, setTempVibes] = useState([]);
  const [tempBlacklist, setTempBlacklist] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [matched, setMatched] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [matchIdx, setMatchIdx] = useState(0);
  const [roundWinners, setRoundWinners] = useState([]);
  const [champion, setChampion] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [picking, setPicking] = useState(null);
  const [mySchedule, setMySchedule] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [flipped, setFlipped] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [champFlipped, setChampFlipped] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [challengeMode, setChallengeMode] = useState(false);
  const timeSlot = getTimeSlot();

  // ── 피드백 누적 (온보딩 B) ──
  function saveFeedback(chosenActivities) {
    try {
      const prev = JSON.parse(localStorage.getItem("vibe_feedback") || "{}");
      chosenActivities.forEach(act => {
        (act.vibe || []).forEach(v => {
          prev[v] = (prev[v] || 0) + 1;
        });
      });
      localStorage.setItem("vibe_feedback", JSON.stringify(prev));

      // 상위 5개 vibe 자동으로 preferredVibes에 반영
      const sorted = Object.entries(prev).sort((a,b) => b[1]-a[1]).slice(0,5).map(e=>e[0]);
      const prefs = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
      prefs.learnedVibes = sorted;
      localStorage.setItem("vibe_prefs", JSON.stringify(prefs));
    } catch {}
  }

  function getLearnedVibes() {
    try {
      const prefs = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
      return prefs.learnedVibes || [];
    } catch { return []; }
  }
  function getHistory() {
    try { return JSON.parse(localStorage.getItem("vibe_history") || "[]"); } catch { return []; }
  }
  function addHistory(ids) {
    try {
      const prev = getHistory();
      const next = [...new Set([...ids, ...prev])].slice(0, 30);
      localStorage.setItem("vibe_history", JSON.stringify(next));
    } catch {}
  }
  function clearHistory() {
    try { localStorage.removeItem("vibe_history"); } catch {}
  }

  // ── 시간대 보너스 ──
  function getTimeBonus(act) {
    const h = new Date().getHours();
    const g = act.genre;
    if (h >= 6  && h < 10) { // 아침
      if (["nature","fitness","cooking"].includes(g)) return 2;
    }
    if (h >= 18 && h < 21) { // 저녁
      if (["cooking","social","culture"].includes(g)) return 2;
    }
    if (h >= 21 || h < 2) { // 밤
      if (["healing","culture","art"].includes(g)) return 2;
      if (["water","mountain","sport"].includes(g)) return -3;
    }
    return 0;
  }

  const canStart = answers.need && answers.alone && answers.location && answers.cost;
  const missing = ["need","alone","location","cost"].filter(k => !answers[k]);

  function toggleExpand(qid, val) {
    const key = `${qid}_${val}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
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

  function selectOption(qid, val) {
    setAnswers(a => ({ ...a, [qid]: val }));
  }

  // 에너지 서브 선택에 따라 동적으로 서브옵션 추가
  function getDynamicSubs(qid, optValue, baseSubs) {
    return baseSubs;
  }

  function startTournament(isChallenge = false) {
    const history = getHistory();
    const learnedVibes = getLearnedVibes();
    // learned vibes를 preferredVibes에 합쳐서 매칭
    const enrichedAnswers = {
      ...answers,
      preferredVibes: [...new Set([...(answers.preferredVibes || []), ...learnedVibes])]
    };
    let m = matchActivities(enrichedAnswers);

    // 시간대 보너스 반영
    m = m.map(act => ({ ...act, score: (act.score || 0) + getTimeBonus(act) }))
         .sort((a, b) => b.score - a.score);

    // 도전 모드: 히스토리에 없는 것만
    if (isChallenge) {
      const fresh = m.filter(act => !history.includes(act.id));
      m = fresh.length >= 8 ? fresh : m; // 8개 미만이면 그냥 전체
    } else {
      // 일반 모드: 최근 나온 것들 뒤로 밀기
      m = m.sort((a, b) => {
        const aNew = history.includes(a.id) ? 1 : 0;
        const bNew = history.includes(b.id) ? 1 : 0;
        return aNew - bNew || b.score - a.score;
      });
    }

    setMatched(m);
    const pool = [...m.slice(0, 14)].sort(() => Math.random() - 0.5).slice(0, 8);
    setBracket(pool);
    setMatchIdx(0);
    setRoundWinners([]);
    setChampion(null);
    setChallengeMode(isChallenge);
    setScreen("tournament");
  }

  function pickWinner(winner, side) {
    setPicking(side);
    setTournamentHistory(h => [...h, winner]);
    setTimeout(() => {
      setPicking(null);
      const newWinners = [...roundWinners, winner];
      const nextIdx = matchIdx + 2;

      if (nextIdx >= bracket.length) {
        // 라운드 끝
        if (newWinners.length === 1) {
          // 챔피언 결정
          setChampion(newWinners[0]);
          const initialSchedule = [newWinners[0]];
          setMySchedule(initialSchedule);
          // 히스토리 저장
          addHistory(bracket.map(a => a.id));
          // 피드백 누적 (내가 고른 것들의 vibe 패턴 학습)
          saveFeedback([...tournamentHistory, newWinners[0]]);
          // 추천 카드: 챔피언 제외 상위 6개
          const suggs = [];
          for (const act of matched.filter(a => a.id !== newWinners[0].id)) {
            if (suggs.length >= 6) break;
            suggs.push(act);
          }
          setSuggestions(suggs);
          setScreen("result");
        } else {
          // 다음 라운드
          setBracket(newWinners);
          setMatchIdx(0);
          setRoundWinners([]);
        }
      } else {
        setMatchIdx(nextIdx);
        setRoundWinners(newWinners);
      }
    }, 400);
  }

  const pair = bracket.slice(matchIdx, matchIdx + 2);
  const totalMatches = bracket.length / 2;
  const currentMatch = Math.floor(matchIdx / 2) + 1;

  return (
    <div style={{ minHeight:"100vh", background:"#F5F4F0", fontFamily:"'Noto Sans KR', sans-serif", color:"#191919" }}>

      {/* ── 온보딩 화면 ── */}
      {screen === "onboarding" && (() => {
        const VIBE_OPTIONS = [
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
          { value:"기다리는맛",    emoji:"🎣", label:"기다리는 맛" },
          { value:"도전",          emoji:"🔥", label:"도전" },
          { value:"자유로움",      emoji:"🪁", label:"자유롭게" },
        ];
        const BLACKLIST_OPTIONS = [
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
        ];

        const isFirstRun = !localStorage.getItem("vibe_onboarded");
        if (!isFirstRun) {
          setTimeout(() => {
            const saved = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
            setAnswers(a => ({ ...a, preferredVibes: saved.vibes || [], blacklistGenres: saved.blacklist || [] }));
            setScreen("setup");
          }, 0);
          return null;
        }

        const btnStyle = (selected, isBlack) => ({
          width:"100%", aspectRatio:"1", borderRadius:16, display:"flex",
          flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:3, border: selected
            ? `2px solid ${isBlack ? "#191919" : "#FF4444"}`
            : "1.5px solid #E0DED8",
          background: selected ? (isBlack ? "#191919" : "#FFF0F0") : "#fff",
          color: selected ? (isBlack ? "#fff" : "#CC0000") : "#555",
          fontSize:10, fontWeight:700, cursor:"pointer",
          fontFamily:"inherit", transition:"all 0.15s", padding:0,
        });

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
                return (
                  <button key={v.value} onClick={() =>
                    setTempVibes(p => p.includes(v.value)
                      ? p.filter(x=>x!==v.value)
                      : p.length < 5 ? [...p, v.value] : p)
                  } style={btnStyle(sel, true)}>
                    <span style={{fontSize:20}}>{v.emoji}</span>
                    <span style={{lineHeight:1.2,textAlign:"center",padding:"0 2px"}}>{v.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize:13, fontWeight:800, marginBottom:10, color:"#333" }}>
              절대 안 하는 것 <span style={{color:"#aaa",fontWeight:500,fontSize:11}}>(추천에서 제외)</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:28 }}>
              {BLACKLIST_OPTIONS.map(v => {
                const sel = tempBlacklist.includes(v.value);
                return (
                  <button key={v.value} onClick={() =>
                    setTempBlacklist(p => p.includes(v.value)
                      ? p.filter(x=>x!==v.value) : [...p, v.value])
                  } style={btnStyle(sel, false)}>
                    <span style={{fontSize:20}}>{v.emoji}</span>
                    <span style={{lineHeight:1.2,textAlign:"center",padding:"0 2px"}}>{v.label}</span>
                  </button>
                );
              })}
            </div>

            <button className="start-btn" onClick={() => {
              const prefs = { vibes: tempVibes, blacklist: tempBlacklist };
              localStorage.setItem("vibe_prefs", JSON.stringify(prefs));
              localStorage.setItem("vibe_onboarded", "1");
              setAnswers(a => ({ ...a, preferredVibes: tempVibes, blacklistGenres: tempBlacklist }));
              setScreen("setup");
            }}>
              {(tempVibes.length + tempBlacklist.length) > 0 ? "완료 → 시작하기 🚀" : "그냥 넘어갈게 →"}
            </button>
          </div>
        );
      })()}

      {/* ── 설정 화면 ── */}
      {screen === "setup" && (
        <div className="screen fade-in">
          <div style={{ marginBottom:28, paddingTop:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.5px" }}>오늘 뭐하지? ✨</div>
              <button onClick={() => {
                localStorage.removeItem("vibe_onboarded");
                localStorage.removeItem("vibe_prefs");
                setTempVibes([]); setTempBlacklist([]);
                setScreen("onboarding");
              }} style={{
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
                        const expKey = `${q.id}_${opt.value}`;
                        const isExpanded = expanded[expKey];

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
                                {getDynamicSubs(q.id, opt.value, opt.subs).map(sub => {
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

          <button className="start-btn" disabled={!canStart} onClick={() => startTournament(false)}>
            {canStart ? "취향 찾기 시작 →" : `아직 ${missing.length}개 남았어`}
          </button>
          {canStart && (
            <button onClick={() => startTournament(true)} style={{
              width:"100%", marginTop:10, padding:"13px",
              background:"transparent", border:"1.5px dashed #C8C4BC",
              borderRadius:16, fontSize:14, fontWeight:700,
              color:"#888", cursor:"pointer", fontFamily:"inherit"
            }}>
              ✦ 도전 모드 — 안 해본 것들로만
            </button>
          )}
        </div>
      )}

      {/* ── 토너먼트 화면 ── */}
      {screen === "tournament" && pair.length >= 2 && (
        <div className="tournament-screen fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${(currentMatch / totalMatches) * 100}%` }} />
          </div>
          <div className="match-label">둘 중에 더 끌리는 거 골라봐 · {currentMatch}/{totalMatches}</div>

          <div className="cards-wrap">
            <div
              className={`toss-card ${picking === "left" ? "picking-left" : ""}`}
              onClick={() => pickWinner(pair[0], "left")}
            >
              <div className="card-emoji">{pair[0].emoji}</div>
              <div className="card-name">{pair[0].name}</div>
              <div className="card-time">{pair[0].time}분</div>
            </div>

            <div className="vs-divider">VS</div>

            <div
              className={`toss-card ${picking === "right" ? "picking-right" : ""}`}
              onClick={() => pickWinner(pair[1], "right")}
            >
              <div className="card-emoji">{pair[1].emoji}</div>
              <div className="card-name">{pair[1].name}</div>
              <div className="card-time">{pair[1].time}분</div>
            </div>
          </div>

          <button style={{ background:"transparent", border:"none", color:"#bbb", fontSize:13, cursor:"pointer", marginTop:24, width:"100%", fontFamily:"inherit" }}
            onClick={() => setScreen("setup")}>← 다시 설정</button>
        </div>
      )}

      {/* ── 결과 화면 ── */}
      {screen === "result" && champion && (() => {
        const learnedVibes = getLearnedVibes();
        const VIBE_LABEL = {
          고요함:"조용하고 고요한 것", 두근거림:"두근거리는 것", 땀흘리기:"땀 흘리는 것",
          감성충전:"감성 충전", 완성하는기쁨:"완성의 기쁨", 자연감성:"자연 속 활동",
          소소한사치:"소소한 사치", 지적자극:"머리 쓰는 활동", 혼자만의시간:"혼자만의 시간",
          새로운경험:"새로운 경험", 야간감성:"밤 감성", 도전:"도전적인 활동", 자유로움:"자유로운 활동",
        };
        return (
        <div className="result-screen fade-in">

          {/* 패턴 학습 배지 */}
          {learnedVibes.length >= 2 && (
            <div style={{
              background:"#F5F3EE", borderRadius:14, padding:"10px 14px",
              marginBottom:12, fontSize:12, color:"#666", lineHeight:1.6
            }}>
              📊 <b>너의 취향 패턴</b> — {learnedVibes.slice(0,3).map(v => VIBE_LABEL[v] || v).join(", ")} 을 자주 선택했어
            </div>
          )}
          <div style={{ perspective:"800px", marginBottom:12, height:200 }} onClick={() => setChampFlipped(f => !f)}>
            <div style={{
              width:"100%", height:"100%", position:"relative",
              transformStyle:"preserve-3d",
              transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",
              transform: champFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              cursor:"pointer"
            }}>
              {/* 앞면 */}
              <div style={{
                position:"absolute", width:"100%", height:"100%",
                backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                background:"#191919", borderRadius:28, padding:"28px 24px",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8
              }}>
                <div style={{fontSize:10, color:"rgba(255,255,255,0.4)"}}>탭해서 자세히 보기</div>
                <div style={{fontSize:52}}>{champion.emoji}</div>
                <div style={{fontSize:22, fontWeight:900, color:"#fff"}}>{champion.name}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
                  <span className="champ-badge">오늘의 픽 ✦</span>
                  <span className="champ-badge">{champion.time}분</span>
                </div>
                {champion.reason && (
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:4, lineHeight:1.5 }}>
                    💬 {champion.reason}
                  </div>
                )}
              </div>
              {/* 뒷면 */}
              <div style={{
                position:"absolute", width:"100%", height:"100%",
                backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                transform:"rotateY(180deg)",
                background:"#191919", color:"#fff", borderRadius:28,
                padding:"28px 24px",
                display:"flex", flexDirection:"column", justifyContent:"center", gap:14
              }}>
                <div style={{fontSize:28}}>{champion.emoji}</div>
                <div style={{fontSize:15, fontWeight:700, lineHeight:1.6, color:"#fff"}}>{champion.hint}</div>
                <div style={{fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6}}>💡 {champion.tip}</div>
              </div>
            </div>
          </div>

          {/* 내 결과 보기 버튼 — 항상 챔피언 카드 바로 아래 */}
          <div style={{ marginBottom:20 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowResultModal(true); }}
              style={{
                width:"100%", padding:"13px", background:"#fff",
                border:"1.5px solid #E0DED8", borderRadius:14,
                fontSize:14, fontWeight:700, cursor:"pointer",
                fontFamily:"inherit", color:"#191919",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6
              }}>
              🏆 내 취향 결과 보기
            </button>
          </div>

          {/* 이것도 어때? 추천 카드 */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div className="schedule-title" style={{margin:0}}>이것도 어때?</div>
              <button onClick={() => setShowModal(true)} style={{
                background:"none", border:"none", fontSize:12, color:"#888", cursor:"pointer",
                fontFamily:"inherit", fontWeight:700, textDecoration:"underline"
              }}>전체 보기</button>
            </div>
            <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none" }}>
              {suggestions
                .filter(s => !mySchedule.find(m => m.id === s.id))
                .slice(0, 5)
                .map(act => {
                  const isFlipped = flipped === act.id;
                  return (
                    <div key={act.id} style={{ perspective:"600px", flexShrink:0 }}>
                      <div style={{
                        width:130, height:190, position:"relative",
                        transformStyle:"preserve-3d",
                        transition:"transform 0.45s cubic-bezier(0.4,0,0.2,1)",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        cursor:"pointer"
                      }} onClick={() => setFlipped(isFlipped ? null : act.id)}>

                        {/* 앞면 */}
                        <div style={{
                          position:"absolute", width:"100%", height:"100%",
                          backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                          background:"#fff", borderRadius:18, padding:"16px 12px",
                          boxShadow:"0 1px 6px rgba(0,0,0,0.07)", textAlign:"center",
                          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6
                        }}>
                          <div style={{ fontSize:34 }}>{act.emoji}</div>
                          <div style={{ fontSize:13, fontWeight:700 }}>{act.name}</div>
                          <div style={{ fontSize:11, color:"#aaa" }}>{act.time}분</div>
                        </div>

                        {/* 뒷면 */}
                        <div style={{
                          position:"absolute", width:"100%", height:"100%",
                          backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                          transform:"rotateY(180deg)",
                          background:"#191919", borderRadius:18, padding:"14px 12px",
                          display:"flex", flexDirection:"column", gap:6,
                          justifyContent:"space-between", textAlign:"left"
                        }}>
                          <div style={{ fontSize:16 }}>{act.emoji}</div>
                          <div style={{ fontSize:11, fontWeight:700, color:"#fff", lineHeight:1.4 }}>{act.hint}</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", lineHeight:1.4 }}>💡 {act.tip}</div>
                          <button onClick={e => {
                            e.stopPropagation();
                            if (!mySchedule.find(m => m.id === act.id)) {
                              setMySchedule(sortSchedule([...mySchedule, act], timeSlot));
                            }
                            setFlipped(null);
                          }} style={{
                            background:"#fff", color:"#191919", border:"none",
                            borderRadius:8, padding:"6px 14px", fontSize:11,
                            fontWeight:700, cursor:"pointer", fontFamily:"inherit", width:"100%"
                          }}>+ 추가</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 전체 보기 모달 */}
          {showModal && (
            <div style={{
              position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100,
              display:"flex", alignItems:"flex-end"
            }} onClick={() => setShowModal(false)}>
              <div style={{
                background:"#F5F4F0", borderRadius:"24px 24px 0 0", padding:"24px 20px 40px",
                width:"100%", maxHeight:"75vh", overflowY:"auto"
              }} onClick={e => e.stopPropagation()}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div style={{ fontWeight:900, fontSize:18 }}>전체 추천 활동</div>
                  <button onClick={() => setShowModal(false)} style={{
                    background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#888"
                  }}>×</button>
                </div>
                {matched
                  .filter(a => !mySchedule.find(m => m.id === a.id))
                  .map(act => (
                  <div key={act.id} style={{
                    background:"#fff", borderRadius:14, padding:"14px 16px",
                    display:"flex", alignItems:"center", gap:12, marginBottom:10,
                    boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ fontSize:26 }}>{act.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{act.name}</div>
                      <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>{act.time}분</div>
                    </div>
                    <button onClick={() => {
                      setMySchedule(sortSchedule([...mySchedule, act], timeSlot));
                      setShowModal(false);
                    }} style={{
                      background:"#191919", color:"#fff", border:"none",
                      borderRadius:8, padding:"7px 14px", fontSize:12,
                      fontWeight:700, cursor:"pointer", fontFamily:"inherit"
                    }}>+ 추가</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 내 취향 결과 모달 */}
          {showResultModal && (
            <div style={{
              position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200,
              display:"flex", alignItems:"flex-end"
            }} onClick={() => setShowResultModal(false)}>
              <div style={{
                background:"#F5F4F0", borderRadius:"24px 24px 0 0", padding:"28px 20px 48px",
                width:"100%", maxHeight:"80vh", overflowY:"auto"
              }} onClick={e => e.stopPropagation()}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontWeight:900, fontSize:20 }}>오늘의 취향 결과 🏆</div>
                  <button onClick={() => setShowResultModal(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#888" }}>×</button>
                </div>
                <div style={{ fontSize:13, color:"#aaa", marginBottom:20 }}>토너먼트에서 내가 선택한 순서야</div>

                {/* 토너먼트 히스토리 */}
                {tournamentHistory.slice(0, 4).map((act, i) => (
                  <div key={act.id + i} style={{
                    background:"#fff", borderRadius:16, padding:"16px 18px",
                    display:"flex", alignItems:"center", gap:14, marginBottom:10,
                    boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      width:32, height:32, borderRadius:"50%",
                      background: i === 0 ? "#191919" : "#F0EDE8",
                      color: i === 0 ? "#fff" : "#999",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontWeight:900, fontSize:14, flexShrink:0
                    }}>{i + 1}</div>
                    <div style={{ fontSize:26 }}>{act.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{act.name}</div>
                      <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>{act.hint}</div>
                    </div>
                  </div>
                ))}

                <div style={{ height:1, background:"#E8E5E0", margin:"20px 0" }} />

                {/* 확정 일정 */}
                <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>📋 오늘 확정 일정</div>
                {mySchedule.map((act, i) => (
                  <div key={act.id} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 0",
                    borderBottom:"1px solid #ECEAE4"
                  }}>
                    <div style={{ fontSize:13, color:"#ccc", fontWeight:700, minWidth:20 }}>{i+1}</div>
                    <div style={{ fontSize:22 }}>{act.emoji}</div>
                    <div style={{ flex:1, fontWeight:600, fontSize:14 }}>{act.name}</div>
                    <div style={{ fontSize:12, color:"#aaa" }}>{act.time}분</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 내 일정 */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div className="schedule-title" style={{ margin:0 }}>내 오늘 일정</div>
              <div style={{ fontSize:12, color:"#aaa" }}>
                총 {mySchedule.reduce((s,a) => s+a.time, 0)}분 / {answers.hours*60}분
              </div>
            </div>

            {mySchedule.map((act, i) => (
              <div key={act.id} className="schedule-item">
                <div style={{ fontSize:13, color:"#ccc", fontWeight:700, minWidth:18 }}>{i+1}</div>
                <div className="s-emoji">{act.emoji}</div>
                <div className="s-name">{act.name}</div>
                <div className="s-time">{act.time}분</div>
                {act.id !== champion.id && (
                  <button onClick={() => setMySchedule(sortSchedule(mySchedule.filter(m => m.id !== act.id), timeSlot))}
                    style={{ background:"none", border:"none", color:"#ccc", fontSize:16, cursor:"pointer", padding:"0 4px" }}>×</button>
                )}
              </div>
            ))}

            {mySchedule.reduce((s,a) => s+a.time, 0) < answers.hours * 60 && (
              <div style={{ textAlign:"center", padding:"16px", color:"#ccc", fontSize:13 }}>
                위에서 활동 추가해봐 👆
              </div>
            )}
          </div>

          <div style={{
            position:"sticky", bottom:0, background:"#F5F4F0",
            padding:"12px 0 24px", marginTop:8
          }}>
            <button className="start-btn" onClick={() => {
              setScreen("setup");
              setAnswers({ need:"", alone:"", location:"", cost:"", hours:2, subs:{}, preferredVibes: answers.preferredVibes, blacklistGenres: answers.blacklistGenres });
              setExpanded({});
              setMySchedule([]);
              setSuggestions([]);
              setTournamentHistory([]);
              setChampFlipped(false);
            }}>다시 해보기</button>
            <button onClick={() => { clearHistory(); alert("히스토리 초기화됐어. 다음부터 모든 활동이 다시 나와!"); }} style={{
              width:"100%", marginTop:8, padding:"10px",
              background:"transparent", border:"none",
              fontSize:12, color:"#bbb", cursor:"pointer", fontFamily:"inherit"
            }}>↺ 히스토리 초기화 (처음부터 다시)</button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
