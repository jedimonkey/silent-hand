import { useState, useEffect } from "react";
import { Task } from "../service-worker/types";
import { STORE_NAME } from "../service-worker/config";
import { openDB, closeDB } from "../utils/db";

export function useRunningTasks() {
  const [runningTasks, setRunningTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchRunningTasks = async () => {
      try {
        const db = await openDB();
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
      } catch (error) {
        console.error("Error opening database:", error);
      }
    };

    const handleTaskUpdate = (event: MessageEvent) => {
      if (event.data.type === "TASK_UPDATE") {
        fetchRunningTasks();
      }
    };

    fetchRunningTasks();
    navigator.serviceWorker.addEventListener("message", handleTaskUpdate);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleTaskUpdate);
      closeDB();
    };
  }, []);

  return runningTasks;
}
