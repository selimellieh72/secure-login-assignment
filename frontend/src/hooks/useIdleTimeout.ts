import { useEffect, useMemo, useRef, useState } from 'react';

interface IdleTimeoutState {
  idleMs: number;
  resetActivity: () => void;
}

export const useIdleTimeout = (): IdleTimeoutState => {
  const [now, setNow] = useState(() => Date.now());
  const lastActivityRef = useRef(Date.now());

  const idleMs = useMemo(() => Math.max(0, now - lastActivityRef.current), [now]);

  const resetActivity = () => {
    lastActivityRef.current = Date.now();
    setNow(Date.now());
  };

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    const handleActivity = () => resetActivity();

    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, []);

  return {
    idleMs,
    resetActivity,
  };
};
