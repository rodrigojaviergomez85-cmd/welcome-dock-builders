import { cn } from "@/lib/utils";

/**
 * Banderas dibujadas con código (simplificadas), porque algunos sistemas
 * —por ejemplo Windows— no muestran los emojis de banderas.
 */
export function FlagIcon({
  id,
  className,
  wave = false,
}: {
  id: string;
  className?: string;
  wave?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={cn(
        "h-auto w-12 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-foreground/15",
        wave && "motion-safe:animate-[flag-wave_2.4s_ease-in-out_infinite]",
        className,
      )}
      aria-hidden
    >
      <FlagShapes id={id} />
    </svg>
  );
}

function FlagShapes({ id }: { id: string }) {
  switch (id) {
    case "c-mexico":
      return (
        <>
          <rect width="10" height="20" fill="#006847" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#CE1126" />
          <circle cx="15" cy="10" r="2.6" fill="#8C5A2B" />
        </>
      );
    case "c-brazil":
      return (
        <>
          <rect width="30" height="20" fill="#009C3B" />
          <path d="M15 2.5 27 10 15 17.5 3 10Z" fill="#FFDF00" />
          <circle cx="15" cy="10" r="4.4" fill="#002776" />
        </>
      );
    case "c-colombia":
      return (
        <>
          <rect width="30" height="10" fill="#FCD116" />
          <rect y="10" width="30" height="5" fill="#003893" />
          <rect y="15" width="30" height="5" fill="#CE1126" />
        </>
      );
    case "c-el-salvador":
      return (
        <>
          <rect width="30" height="20" fill="#0F47AF" />
          <rect y="6.67" width="30" height="6.67" fill="#fff" />
          <circle cx="15" cy="10" r="2.2" fill="none" stroke="#C8A200" strokeWidth="0.8" />
        </>
      );
    case "c-guatemala":
      return (
        <>
          <rect width="30" height="20" fill="#4997D0" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <circle cx="15" cy="10" r="2.4" fill="none" stroke="#2E8B57" strokeWidth="0.9" />
        </>
      );
    case "c-peru":
      return (
        <>
          <rect width="30" height="20" fill="#D91023" />
          <rect x="10" width="10" height="20" fill="#fff" />
        </>
      );
    case "c-argentina":
      return (
        <>
          <rect width="30" height="20" fill="#74ACDF" />
          <rect y="6.67" width="30" height="6.67" fill="#fff" />
          <circle cx="15" cy="10" r="2.2" fill="#F6B40E" />
        </>
      );
    case "c-united-states":
      return (
        <>
          <rect width="30" height="20" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={i * (20 / 13)} width="30" height={20 / 13} fill="#B22234" />
          ))}
          <rect width="13" height={(20 / 13) * 7} fill="#3C3B6E" />
        </>
      );
    default:
      return <rect width="30" height="20" fill="#ccc" />;
  }
}
