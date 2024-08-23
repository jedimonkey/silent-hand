import { useState, useEffect } from "react";
import { Task } from "../../service-worker/types";
import { DB_NAME, COMPLETED_STORE_NAME } from "./config";

interface CompletedTasksResult {
  totalTasks: number;
  tasks: Task[];
}

export function useCompletedTasks(limit?: number): CompletedTasksResult {
  const [completedTasks, setCompletedTasks] = useState<CompletedTasksResult>({
    totalTasks: 0,
    tasks: [],
  });

  useEffect(() => {
    let db: IDBDatabase | null = null;

    const openDB = () => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = (event) => {
        db = (event.target as IDBOpenDBRequest).result;
        fetchCompletedTasks();
      };
      request.onerror = (event) => {
        console.error(
          "Error opening database:",
          (event.target as IDBOpenDBRequest).error
        );
      };
    };

    const fetchCompletedTasks = () => {
      if (!db) return;

      const transaction = db.transaction(COMPLETED_STORE_NAME, "readonly");
      const store = transaction.objectStore(COMPLETED_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const allTasks = (event.target as IDBRequest).result as Task[];
        const completed = allTasks;
        const totalTasks = completed.length;

        // Sort tasks by updatedAt in descending order
        completed.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        // Limit the number of tasks if specified
        const limitedTasks = limit ? completed.slice(0, limit) : completed;

        setCompletedTasks({
          totalTasks,
          tasks: limitedTasks,
        });
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
        fetchCompletedTasks();
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
  }, [limit]);

  return completedTasks;
}
