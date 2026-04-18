import { useCallback, useRef } from 'react';

export function useGameLoop(onFrame: (deltaTime: number) => void) {
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const loop = useCallback(
    (timestamp: number) => {
      if (!isRunningRef.current) return;

      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 0;
      lastTimeRef.current = timestamp;

      onFrame(deltaTime);

      rafIdRef.current = requestAnimationFrame(loop);
    },
    [onFrame]
  );

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = 0;
    rafIdRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
  }, []);

  return { start, stop };
}
