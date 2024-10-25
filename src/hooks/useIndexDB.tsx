import { useState, useEffect } from "react";
import { openDB } from "idb";

async function getDB() {
  const db = await openDB("pga_of_america_chat", 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains("new_conversation")) {
        db.createObjectStore("new_conversation", { keyPath: "id" });
      }
    },
  });
  return db;
}

function useIndexDB<T>(key: string, initialValue: T, isReset?: boolean) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function fetchData() {
      try {
        const db = await getDB();
        const tx = db.transaction("new_conversation", "readonly");
        const store = tx.objectStore("new_conversation");
        const item = await store.get(key);
        setStoredValue(item && !isReset ? item.value : initialValue);
      } catch (error) {
        console.log(error, 'fetchData');
        setStoredValue(initialValue);
      }
    }

    fetchData();
  }, [key, initialValue, isReset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function updateData() {
      try {
        const db = await getDB();
        const tx = db.transaction("new_conversation", "readwrite");
        const store = tx.objectStore("new_conversation");
        await store.put({ id: key, value: storedValue });
      } catch (error) {
        console.log(error, 'updateData');
      }
    }

    updateData();
  }, [storedValue, key]);

  return [storedValue, setStoredValue] as const;
}

export default useIndexDB;
