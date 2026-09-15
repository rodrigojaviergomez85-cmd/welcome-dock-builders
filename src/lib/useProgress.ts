import { useCallback, useEffect, useState } from "react";
import {
  emptyState,
  loadProgress,
  saveProgress,
  type ProgressState,
} from "./progress";

/** Lee el progreso después de hidratar, para no romper el render del servidor. */
export function useProgress() {
  const [state, setState] = useState<ProgressState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadProgress());
    setReady(true);
  }, []);

  const update = useCallback((next: ProgressState | ((prev: ProgressState) => ProgressState)) => {
    setState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      saveProgress(value);
      return value;
    });
  }, []);

  const reset = useCallback(() => {
    const fresh = emptyState();
    saveProgress(fresh);
    setState(fresh);
  }, []);

  return { state, ready, update, reset };
}
