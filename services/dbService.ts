const DB_NAME = 'PhotoStudioDB';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;
let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(true);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB');
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = () => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveBlob = (id: string, blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!db) {
        return reject("DB not initialized");
    }
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, blob });
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

export const getBlob = (id: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!db) {
          return reject("DB not initialized");
      }
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
          if (request.result) {
              resolve(request.result.blob);
          } else {
              reject(`Blob with id ${id} not found`);
          }
      };
      request.onerror = () => reject(request.error);
    });
};

export const deleteBlob = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("DB not initialized");
      }
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
};