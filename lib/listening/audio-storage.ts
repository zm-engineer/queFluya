// Persist uploaded audio files in IndexedDB (localStorage can't hold multi-MB
// blobs). Only the metadata is listed; the blob is read on demand when played.

const DB_NAME = 'quefluya-audio'
const STORE = 'files'

export type StoredAudio = { id: string; name: string }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveAudioFile(name: string, blob: Blob): Promise<StoredAudio> {
  const db = await openDb()
  const id = crypto.randomUUID()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ id, name, blob })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  return { id, name }
}

export async function listAudioFiles(): Promise<StoredAudio[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = () =>
      resolve(
        (req.result as { id: string; name: string }[]).map(({ id, name }) => ({
          id,
          name,
        }))
      )
    req.onerror = () => reject(req.error)
  })
}

export async function getAudioFile(id: string): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id)
    req.onsuccess = () =>
      resolve((req.result as { blob: Blob } | undefined)?.blob ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteAudioFile(id: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
