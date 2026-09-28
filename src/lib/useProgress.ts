import { useCallback, useEffect, useRef, useState } from "react";
import {
  PROGRESS_KEY,
  emptyState,
  loadProgress,
  saveProgress,
  type ProgressState,
} from "./progress";

const PROGRESS_EVENT = "kids-progress-changed";

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

  // Varias pantallas usan este hook a la vez: todas parten de lo guardado y se avisan
  // entre sí, para que ninguna pise lo que otra acaba de guardar (Pip, país, etc.).
  useEffect(() => {
    const onChange = () => {
      const loaded = loadProgress();
      latest.current = loaded;
      setState(loaded);
    };
    window.addEventListener(PROGRESS_EVENT, onChange);
    return () => window.removeEventListener(PROGRESS_EVENT, onChange);
  }, []);

  const update = useCallback((next: ProgressState | ((prev: ProgressState) => ProgressState)) => {
    let hasSaved = false;
    try {
      hasSaved = window.localStorage.getItem(PROGRESS_KEY) !== null;
    } catch {
      hasSaved = false;
    }
    // Si el navegador no guarda, se sigue con lo que hay en memoria.
    const base = hasSaved ? loadProgress() : (latest.current ?? emptyState());
    const value = typeof next === "function" ? next(base) : next;
    latest.current = value;
    saveProgress(value);
    setState(value);
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }, []);

  const reset = useCallback(() => {
    const fresh = emptyState();
    latest.current = fresh;
    saveProgress(fresh);
    setState(fresh);
    window.dispatchEvent(new Event(PROGRESS_EVENT));
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
