import React, { useState, useEffect } from "react";
import { activities as ACTIVITIES } from '../data/activities.js';
import { buildCoursePlans, extractChampion } from '../features/whatToDo/courseBuilder.js';
import { SODA_COLORS } from './whatToDo/constants.js';
import { matchActivities, getTimeSlot, getTimeBonus, getLearnedVibes, getHistory, addHistory, saveFeedback } from './whatToDo/matchEngine.js';
import TournamentCard from './shared/TournamentCard.jsx';
import OnboardingScreen from './whatToDo/OnboardingScreen.jsx';
import SetupScreen from './whatToDo/SetupScreen.jsx';
import ResultScreen from './whatToDo/ResultScreen.jsx';

export default function WhatToDo({ answers, setAnswers, sodaKeys, setSodaKeys, sodaColorRef, onHideTabBar, goToPlaceFromContext }) {
  const [screen, setScreen] = useState("onboarding");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [tempVibes, setTempVibes] = useState([]);
  const [tempBlacklist, setTempBlacklist] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [matched, setMatched] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [matchIdx, setMatchIdx] = useState(0);
  const [roundWinners, setRoundWinners] = useState([]);
  const [champion, setChampion] = useState(null);
  const [picking, setPicking] = useState(null);
  const [mySchedule, setMySchedule] = useState([]);
  const [champFlipped, setChampFlipped] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [challengeMode, setChallengeMode] = useState(false);
  const [championPick, setChampionPick] = useState(null);
  const [showRunnerUps, setShowRunnerUps] = useState(false);

  // ── 탭바 숨김 처리 ──
  useEffect(() => {
    if (screen === "onboarding" || screen === "tournament") {
      onHideTabBar(true);
    } else {
      onHideTabBar(false);
    }
    return () => onHideTabBar(false);
  }, [screen]);

  // ── 온보딩 자동 스킵 (이미 완료한 경우) ──
  useEffect(() => {
    if (screen === "onboarding") {
      const isFirstRun = !localStorage.getItem("vibe_onboarded");
      if (!isFirstRun) {
        const saved = JSON.parse(localStorage.getItem("vibe_prefs") || "{}");
        setAnswers(a => ({ ...a, preferredVibes: saved.vibes || [], blacklistGenres: saved.blacklist || [] }));
        setScreen("setup");
      }
    }
  }, []);

  const canStart = answers.need && answers.alone && answers.location && answers.cost;
  const missing = ["need","alone","location","cost"].filter(k => !answers[k]);

  // ── 코스 빌더 공통 로직 ──
  function buildCourses(selectedAct) {
    try {
      const coursePrefs = {
        need: answers.need, alone: answers.alone,
        location: answers.location, cost: answers.cost,
        subs: answers.subs, hours: answers.hours,
        preferredVibes: answers.preferredVibes,
        blacklistGenres: answers.blacklistGenres,
        timeSlot: getTimeSlot(),
        togetherWith: (answers.subs?.alone || [])[0] || null,
      };
      const plans = buildCoursePlans(ACTIVITIES, coursePrefs, selectedAct.id);
      plans.sort((a, b) => {
        const aHas = a.activities.some(act => act.id === selectedAct.id) ? 1 : 0;
        const bHas = b.activities.some(act => act.id === selectedAct.id) ? 1 : 0;
        return bHas - aHas;
      });
      setCourses(plans);
      setSelectedCourse(null);
      const _cpResult = extractChampion(plans, {
        need: answers.need, subs: answers.subs, alone: answers.alone,
      });
      setChampionPick(_cpResult);
    } catch { setCourses([]); }
  }

  // ── 토너먼트 시작 ──
  function startTournament(isChallenge = false, bracketSize = 16) {
    const history = getHistory();
    const learnedVibes = getLearnedVibes();
    const enrichedAnswers = {
      ...answers,
      preferredVibes: [...new Set([...(answers.preferredVibes || []), ...learnedVibes])]
    };
    let m = matchActivities(enrichedAnswers, ACTIVITIES);
    m = m.map(act => ({ ...act, score: (act.score || 0) + getTimeBonus(act) }))
         .sort((a, b) => b.score - a.score);

    if (isChallenge) {
      const fresh = m.filter(act => !history.includes(act.id));
      m = fresh.length >= 8 ? fresh : m;
    } else {
      m = m.sort((a, b) => {
        const aNew = history.includes(a.id) ? 1 : 0;
        const bNew = history.includes(b.id) ? 1 : 0;
        return aNew - bNew || b.score - a.score;
      });
    }

    setMatched(m);
    const topN = Math.min(bracketSize + 8, m.length);
    const pool = [...m.slice(0, topN)].sort(() => Math.random() - 0.5).slice(0, bracketSize);
    setBracket(pool);
    setMatchIdx(0);
    setRoundWinners([]);
    setChampion(null);
    setChallengeMode(isChallenge);
    setShowRunnerUps(false);
    setScreen("tournament");
  }

  // ── 승자 선택 ──
  function pickWinner(winner, side) {
    if (picking) return;
    setPicking(side);
    sodaColorRef.current._tourney = SODA_COLORS[Math.floor(Math.random() * SODA_COLORS.length)];
    setSodaKeys(p => ({ ...p, _tourney: (p._tourney || 0) + 1 }));
    setTournamentHistory(h => [...h, winner]);
    setTimeout(() => {
      const newWinners = [...roundWinners, winner];
      const nextIdx = matchIdx + 2;

      if (nextIdx >= bracket.length) {
        if (newWinners.length === 1) {
          setChampion(newWinners[0]);
          setMySchedule([newWinners[0]]);
          addHistory(bracket.map(a => a.id));
          saveFeedback([...tournamentHistory, newWinners[0]]);
          buildCourses(newWinners[0]);
          setPicking(null);
          setScreen("result");
        } else {
          setPicking(null);
          setBracket(newWinners);
          setMatchIdx(0);
          setRoundWinners([]);
        }
      } else {
        setPicking(null);
        setMatchIdx(nextIdx);
        setRoundWinners(newWinners);
      }
    }, 900);
  }

  // ── 패자부활 → 코스 재빌드 ──
  function rebuildCourseForActivity(selectedAct) {
    setChampion(selectedAct);
    setShowRunnerUps(false);
    buildCourses(selectedAct);
  }

  // ── 그냥 골라줘 ──
  function quickPick() {
    const learnedVibes = getLearnedVibes();
    const enrichedAnswers = {
      ...answers,
      preferredVibes: [...new Set([...(answers.preferredVibes || []), ...learnedVibes])]
    };
    let m = matchActivities(enrichedAnswers, ACTIVITIES);
    m = m.map(act => ({ ...act, score: (act.score || 0) + getTimeBonus(act) }))
         .sort((a, b) => b.score - a.score);
    const topAct = m[0];
    if (!topAct) return;
    setChampion(topAct);
    setMatched(m);
    buildCourses(topAct);
    setScreen("result");
  }

  // ── 온보딩 완료 ──
  function handleOnboardingComplete(vibes, blacklist) {
    const prefs = { vibes, blacklist };
    localStorage.setItem("vibe_prefs", JSON.stringify(prefs));
    localStorage.setItem("vibe_onboarded", "1");
    setAnswers(a => ({ ...a, preferredVibes: vibes, blacklistGenres: blacklist }));
    setScreen("setup");
  }

  // ── 리셋 ──
  function handleReset() {
    setScreen("setup");
    setMySchedule([]);
    setCourses([]);
    setSelectedCourse(null);
    setTournamentHistory([]);
    setChampFlipped(false);
    setShowRunnerUps(false);
  }

  // ── 온보딩 리셋 ──
  function handleResetOnboarding() {
    localStorage.removeItem("vibe_onboarded");
    localStorage.removeItem("vibe_prefs");
    setTempVibes([]); setTempBlacklist([]);
    setScreen("onboarding");
  }

  // ── 토너먼트 카드 렌더 ──
  const renderActivityCard = (act) => (
    <>
      <div className="card-emoji" style={{ position:"relative", zIndex:4 }}>{act.emoji}</div>
      <div className="card-name" style={{ position:"relative", zIndex:4 }}>{act.name}</div>
      <div className="card-time" style={{ position:"relative", zIndex:4 }}>{act.time}분</div>
    </>
  );

  return (<>
    {/* ── 온보딩 ── */}
    {screen === "onboarding" && (
      <OnboardingScreen
        tempVibes={tempVibes} setTempVibes={setTempVibes}
        tempBlacklist={tempBlacklist} setTempBlacklist={setTempBlacklist}
        sodaKeys={sodaKeys} setSodaKeys={setSodaKeys} sodaColorRef={sodaColorRef}
        onComplete={handleOnboardingComplete}
      />
    )}

    {/* ── 설정 ── */}
    {screen === "setup" && (
      <SetupScreen
        answers={answers} setAnswers={setAnswers}
        expanded={expanded} setExpanded={setExpanded}
        canStart={canStart} missing={missing}
        onStartTournament={startTournament}
        onQuickPick={quickPick}
        onResetOnboarding={handleResetOnboarding}
      />
    )}

    {/* ── 토너먼트 ── */}
    {screen === "tournament" && bracket.length >= 2 && (
      <TournamentCard
        bracket={bracket} matchIdx={matchIdx}
        picking={picking}
        colors={sodaColorRef.current._tourney || ["#eff6ff","#6366f1"]}
        sodaKey={sodaKeys._tourney || 0}
        onPick={pickWinner}
        onBack={() => setScreen("setup")}
        backLabel="← 다시 설정"
        renderInfo={renderActivityCard}
      />
    )}

    {/* ── 결과 ── */}
    {screen === "result" && champion && (
      <ResultScreen
        champion={champion} courses={courses}
        selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse}
        mySchedule={mySchedule} setMySchedule={setMySchedule}
        championPick={championPick}
        answers={answers}
        tournamentHistory={tournamentHistory}
        showRunnerUps={showRunnerUps} setShowRunnerUps={setShowRunnerUps}
        champFlipped={champFlipped} setChampFlipped={setChampFlipped}
        onRebuildCourse={rebuildCourseForActivity}
        onReset={handleReset}
        goToPlaceFromContext={goToPlaceFromContext}
      />
    )}
  </>);
}
