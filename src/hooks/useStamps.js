import { useState, useEffect } from 'react';

// スタンプの種類
const STAMP_TYPES = ['⭐', '🌸', '💮', '🌟', '🎉', '✨', '🌈', '🍀'];

export function useStamps() {
  const [stamps, setStamps] = useState(() => {
    const saved = localStorage.getItem('study-hint-stamps');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('study-hint-stamps', JSON.stringify(stamps));
  }, [stamps]);

  const addStamp = () => {
    const newStamp = {
      id: Date.now(),
      type: STAMP_TYPES[Math.floor(Math.random() * STAMP_TYPES.length)],
      date: new Date().toLocaleDateString('ja-JP'),
    };
    setStamps((prev) => [...prev, newStamp]);
    return newStamp;
  };

  const todayCount = stamps.filter(
    (s) => s.date === new Date().toLocaleDateString('ja-JP')
  ).length;

  return { stamps, addStamp, todayCount, totalCount: stamps.length };
}
