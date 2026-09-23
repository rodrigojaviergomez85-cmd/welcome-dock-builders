/**
 * Las grabaciones se guardan solo en el dispositivo (IndexedDB).
 * No se suben a ningún servidor y el adulto puede borrarlas cuando quiera.
 */

const DB_NAME = "kids-platform-recordings";
const STORE = "clips";

export type StoredRecording = {
  key: string;
  missionId: string;
  turnId: string;
  targetEn: string;
  createdAt: string;
  blob: Blob;
  /** Resultado del intento (para la presentación del día). */
  status?: "heard" | "practiced" | "pending";
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRecording(rec: StoredRecording): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listRecordings(): Promise<StoredRecording[]> {
  const db = await openDb();
  const items = await new Promise<StoredRecording[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as StoredRecording[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function deleteAllRecordings(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
