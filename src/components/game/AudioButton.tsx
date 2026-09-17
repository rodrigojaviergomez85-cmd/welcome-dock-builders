import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClip } from "@/lib/audio";

type Props = {
  /** Un clip o varios que se escuchan seguidos. */
  clipId: string | string[];
  label?: string;
  /** Cambiar este valor intenta reproducir automáticamente (si el navegador lo permite). */
  autoPlayKey?: string | number;
  size?: "sm" | "lg";
  className?: string;
  onEnded?: () => void;
};

export function AudioButton({
  clipId,
  label,
  autoPlayKey,
  size = "lg",
  className,
  onEnded,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;
  const clipKey = Array.isArray(clipId) ? clipId.join("|") : clipId;
  const clipRef = useRef(clipId);
  clipRef.current = clipId;

  const play = () => {
    setPlaying(true);
    void playClip(clipRef.current).then(() => {
      setPlaying(false);
      endedRef.current?.();
    });
  };

  useEffect(() => {
    if (autoPlayKey === undefined) return;
    setPlaying(true);
    let cancelled = false;
    void playClip(clipRef.current).then(() => {
      if (cancelled) return;
      setPlaying(false);
      endedRef.current?.();
    });
    return () => {
      cancelled = true;
    };
  }, [autoPlayKey, clipKey]);

  return (
    <button
      type="button"
      onClick={play}
      aria-label={label ?? "Escuchar otra vez"}
      className={cn(
        "tap-target inline-flex items-center gap-2 rounded-full bg-primary px-5 font-display text-primary-foreground shadow-[var(--shadow-pop)] transition-transform active:translate-y-1 active:shadow-none",
        size === "sm" ? "h-12 text-base" : "h-14 text-lg",
        playing && "animate-bob",
        className,
      )}
    >
      <Volume2 className={cn(size === "sm" ? "size-5" : "size-6")} aria-hidden />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
