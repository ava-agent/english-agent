"use client";

import { useRef, useCallback } from "react";

/**
 * Hook to measure time spent on a card
 */
export function useTimer() {
  const startTime = useRef<number>(0);

  const start = useCallback(() => {
    startTime.current = Date.now();
  }, []);

  const elapsed = useCallback((): number => {
    if (startTime.current === 0) return 0;
    return Date.now() - startTime.current;
  }, []);

  const reset = useCallback(() => {
    startTime.current = 0;
  }, []);

  return { start, elapsed, reset };
}
