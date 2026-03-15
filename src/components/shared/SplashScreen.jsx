import React, { useState, useEffect } from "react";

// 상황별 악센트 컬러
const ACCENT = {
  alone: "#7B9ACC",
  date: "#CC7B8B",
  friend: "#7BCC9A",
  random: "#CCAA7B",
};

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 1600);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  // 그래디언트 라인: 4색 악센트 믹스
  const gradient = `linear-gradient(90deg, ${ACCENT.alone}, ${ACCENT.date}, ${ACCENT.friend}, ${ACCENT.random})`;

  return (
    <div className="splash-screen">
      <div className="splash-title">오늘 뭐하지?</div>
      <div className="splash-line" style={{ background: gradient }} />
    </div>
  );
}
