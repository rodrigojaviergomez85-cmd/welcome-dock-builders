import { useCallback, useEffect, useRef, useState } from "react";
import { emptyState, loadProgress, saveProgress, type ProgressState } from "./progress";

/** Lee el progreso después de hidratar, para no romper el render del servidor. */
export function useProgress() {
  const [state, setState] = useState<ProgressState>(emptyState);
  const [ready, setReady] = useState(false);
  const latest = useRef<ProgressState | null>(null);

  useEffect(() => {
    const loaded = loadProgress();
    latest.current = loaded;
    setState(loaded);
    setReady(true);
    // Guardar también si el navegador cierra o esconde la pestaña de golpe.
    const flush = () => {
      if (latest.current) saveProgress(latest.current);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  const update = useCallback((next: ProgressState | ((prev: ProgressState) => ProgressState)) => {
    setState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      latest.current = value;
      saveProgress(value);
      return value;
    });
  }, []);

  const reset = useCallback(() => {
    const fresh = emptyState();
    latest.current = fresh;
    saveProgress(fresh);
    setState(fresh);
  }, []);

  return { state, ready, update, reset };
}

/** Prueba real de escritura y lectura en el almacenamiento del navegador. */
export function storageWorks(): boolean {
  try {
    const key = "kids-platform-storage-test";
    const value = String(Date.now());
    window.localStorage.setItem(key, value);
    const ok = window.localStorage.getItem(key) === value;
    window.localStorage.removeItem(key);
    return ok;
  } catch {
    return false;
  }
}
