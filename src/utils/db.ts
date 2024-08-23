import {
  COMPLETED_STORE_NAME,
  DB_NAME,
  STORE_NAME,
} from "../service-worker/config";

let db: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      db.createObjectStore(COMPLETED_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };

    // request.onupgradeneeded = (event) => {
    //   const db = (event.target as IDBOpenDBRequest).result;
    //   db.createObjectStore(STORE_NAME, { keyPath: "id" });
    // };
  });
}

export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}
