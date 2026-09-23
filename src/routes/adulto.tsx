import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mic, Trash2, ShieldCheck, RotateCcw, Ear } from "lucide-react";
import { useProgress } from "@/lib/useProgress";
import { getMissionProgress } from "@/lib/progress";
import { mondayMission } from "@/content/missions";
import { deleteAllRecordings, listRecordings, type StoredRecording } from "@/lib/recordings";
import { micSupported } from "@/lib/recorder";

export const Route = createFileRoute("/adulto")({
  head: () => ({
    meta: [
      { title: "Panel para adultos — Explorer Island" },
      {
        name: "description",
        content:
          "Qué guarda la app en este dispositivo, permiso de micrófono, borrado de grabaciones y reinicio del progreso.",
      },
      { property: "og:title", content: "Panel para adultos — Explorer Island" },
      {
        property: "og:description",
        content: "Control de datos guardados, grabaciones y permisos en el dispositivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdultPanel,
});

function AdultPanel() {
  const { state, ready, update, reset } = useProgress();
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [canRecord, setCanRecord] = useState<boolean | null>(null);
  const monday = getMissionProgress(state, mondayMission.id);

  async function refresh() {
    try {
      setRecordings(await listRecordings());
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    void refresh();
    setCanRecord(micSupported());
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4 pb-16">
      <Link
        to="/"
        className="tap-target inline-flex items-center gap-2 rounded-full bg-card px-4 font-display shadow-[var(--shadow-soft)]"
      >
        <ArrowLeft className="size-5" aria-hidden /> Mapa
      </Link>

      <h1 className="mt-6 flex items-center gap-2 font-display text-3xl">
        <ShieldCheck className="size-7" aria-hidden /> Panel para adultos
      </h1>

      <section className="mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl">Qué se guarda y dónde</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Todo se guarda solo en este dispositivo: no hay cuentas ni servidor todavía.</li>
          <li>Progreso y alias: en el almacenamiento local del navegador.</li>
          <li>Grabaciones de voz: en la base local del navegador; no se suben ni se comparten.</li>
          <li>
            Si la escucha está encendida, una copia temporal del intento se envía a un servicio de
            reconocimiento de voz para convertirlo en texto. No se guarda allí y no viaja el nombre
            real del niño (el perfil usa un alias inventado).
          </li>
          <li>No se piden nombre real, edad exacta, dirección, correo ni fotos.</li>
          <li>
            El borrado automático a los 30 días todavía no existe: hoy el borrado es manual con el
            botón de abajo.
          </li>
        </ul>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <Mic className="size-5" aria-hidden /> Micrófono
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {canRecord === null
            ? "Comprobando el navegador…"
            : canRecord
              ? "Este navegador permite grabar. El permiso lo pide el navegador la primera vez que el niño toca “Grabar”."
              : "Este navegador no permite grabar. La misión igual se puede completar: las partes habladas quedan como pendientes."}
        </p>
        <p className="mt-2 text-sm">
          Estado guardado del permiso:{" "}
          {state.micAllowed === true
            ? "concedido en este dispositivo"
            : state.micAllowed === false
              ? "rechazado o no disponible"
              : "todavía no se pidió"}
          .
        </p>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <Ear className="size-5" aria-hidden /> Permitir que el juego escuche y responda
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Encendido, el juego convierte en texto lo que dice el niño y le contesta “¡Te escuché!” o
          le pide intentar otra vez. Para eso, el audio del intento se envía a un servicio de
          reconocimiento de voz y vuelve como texto. Apagado, el juego solo graba, como antes.
        </p>
        <button
          type="button"
          onClick={() =>
            update((prev) => ({ ...prev, listenEnabled: prev.listenEnabled === false }))
          }
          className="tap-target mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-6 font-display text-secondary-foreground"
        >
          {state.listenEnabled === false ? "Encender la escucha" : "Apagar la escucha"}
        </button>
        <p className="mt-2 text-sm">
          Ahora está {state.listenEnabled === false ? "apagada" : "encendida"}.
        </p>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl">Grabaciones guardadas</h2>
        {loadError ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No se pudieron leer las grabaciones en este navegador.
          </p>
        ) : recordings.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No hay grabaciones guardadas.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {recordings.map((rec) => (
              <li key={rec.key} className="rounded-2xl bg-muted p-3">
                {rec.key === "presentation-day1" ? (
                  <p className="mb-1 font-display text-lg text-primary">
                    Presentación del día 1 · {new Date(rec.createdAt).toLocaleDateString("es-AR")} ·{" "}
                    {rec.status === "heard"
                      ? "te escuché"
                      : rec.status === "pending"
                        ? "sin micrófono"
                        : "practicó"}
                  </p>
                ) : null}
                <p lang="en" className="font-display">
                  {rec.targetEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(rec.createdAt).toLocaleString("es-AR")} · marcada como practicada
                </p>
                {rec.blob.size > 0 ? (
                  <audio
                    controls
                    aria-label={
                      rec.key === "presentation-day1"
                        ? "Reproducir presentación del día 1"
                        : "Reproducir grabación"
                    }
                    src={URL.createObjectURL(rec.blob)}
                    className="mt-2 w-full"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={async () => {
            await deleteAllRecordings();
            setRecordings([]);
          }}
          className="tap-target mt-4 inline-flex items-center gap-2 rounded-full bg-destructive px-6 font-display text-destructive-foreground shadow-[var(--shadow-pop)]"
        >
          <Trash2 className="size-5" aria-hidden /> Borrar todas las grabaciones
        </button>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl">Progreso de {mondayMission.dayEs}</h2>
        {ready ? (
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Empezada: {monday.started ? "sí" : "no"}</li>
            <li>Completada: {monday.completed ? `sí (${monday.completions} vez/veces)` : "no"}</li>
            <li>
              Comprensión: {monday.comprehension.correct} aciertos de{" "}
              {monday.comprehension.attempts} intentos
            </li>
            <li>Ayudas en español usadas: {monday.helpsUsed}</li>
            <li>
              Práctica oral:{" "}
              {monday.oral.recordings > 0
                ? `${monday.oral.recordings} frase(s) dichas, ${monday.oral.understood} entendidas por el juego`
                : monday.oral.status === "pending-no-mic"
                  ? "pendiente (todavía no habló)"
                  : "todavía sin frases dichas"}
            </li>
          </ul>
        ) : null}
        <p className="mt-3 text-sm text-muted-foreground">
          Estos datos son de observación, no una evaluación de nivel. “Entendida” significa que se
          reconocieron las palabras de la frase; no se califica la pronunciación.
        </p>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Borrar el avatar y todo el progreso de este dispositivo?"))
              reset();
          }}
          className="tap-target mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-6 font-display text-secondary-foreground"
        >
          <RotateCcw className="size-5" aria-hidden /> Reiniciar progreso y avatar
        </button>
        <button
          type="button"
          onClick={() => update((prev) => ({ ...prev, micAllowed: null }))}
          className="tap-target mt-3 ml-0 inline-flex items-center gap-2 rounded-full bg-muted px-6 font-display text-muted-foreground sm:ml-3"
        >
          Olvidar el estado del micrófono
        </button>
      </section>
    </div>
  );
}
