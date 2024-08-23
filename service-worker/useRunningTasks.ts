import { useState, useEffect } from "react";
import { Task } from "./types";
import { DB_NAME, STORE_NAME } from "./lib";

export function useRunningTasks() {
  const [runningTasks, setRunningTasks] = useState<Task[]>([]);

  useEffect(() => {
    let db: IDBDatabase | null = null;

    const openDB = () => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = (event) => {
        db = (event.target as IDBOpenDBRequest).result;
        fetchRunningTasks();
      };
      request.onerror = (event) => {
        console.error(
          "Error opening database:",
          (event.target as IDBOpenDBRequest).error
        );
      };
    };

    const fetchRunningTasks = () => {
      if (!db) return;

      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const tasks = (event.target as IDBRequest).result as Task[];
        const running = tasks.filter(
          (task) => task.status === "executing" || task.status === "pending"
        );
        setRunningTasks(running);
      };

      request.onerror = (event) => {
        console.error(
          "Error fetching tasks:",
          (event.target as IDBRequest).error
        );
      };
    };

    const handleTaskUpdate = (event: MessageEvent) => {
      if (event.data.type === "TASK_UPDATE") {
        fetchRunningTasks();
      }
    };

    openDB();
    navigator.serviceWorker.addEventListener("message", handleTaskUpdate);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleTaskUpdate);
      if (db) {
        db.close();
      }
    };
  }, []);

  return runningTasks;
}
