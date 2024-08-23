import { STORE_NAME, COMPLETED_STORE_NAME } from "./config";
import { ExtendableMessageEvent, Task, TaskConfig } from "./types";
import { openDB } from "@/utils/db";

let swInstanceId: string;

function generateInstanceId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add task to queue in IndexedDB
async function enqueueTask(task: TaskConfig) {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const now = new Date();
  const taskWithDates = {
    ...task,
    createdAt: now,
    updatedAt: now,
    executedAt: null,
    status: "pending",
  };
  const returnVal = store.add(taskWithDates);
}

// Get the next task from the queue without removing it
async function getNextTask() {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.openCursor();

  return new Promise<Task | null>((resolve, reject) => {
    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const task = cursor.value as Task;
        if (task.status === "pending" || task.instanceId !== swInstanceId) {
          resolve(task);
        } else {
          cursor.continue();
        }
      } else {
        resolve(null); // No more tasks in the queue or no matching tasks found
      }
    };

    request.onerror = (event: Event) => {
      reject("IndexedDB error: " + (event.target as IDBRequest).error);
    };
  });
}

// Update task in IndexedDB
async function updateTaskInStorage(updatedTask: Task) {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  updatedTask.updatedAt = new Date();
  await store.put(updatedTask);
}

// Remove task from queue and add to completed tasks
async function moveTaskToCompleted(task: Task) {
  const db = await openDB();
  const transaction = db.transaction(
    [STORE_NAME, COMPLETED_STORE_NAME],
    "readwrite"
  );
  const taskStore = transaction.objectStore(STORE_NAME);
  const completedStore = transaction.objectStore(COMPLETED_STORE_NAME);
  task.updatedAt = new Date();
  // console.log("finalising task", task.createdAt, task.updatedAt);
  taskStore.delete(task.id);
  completedStore.add(task);
}

// Send task update to all clients
async function sendTaskUpdate(task: Task) {
  try {
    const clients = await (
      self as unknown as ServiceWorkerGlobalScope
    ).clients.matchAll();
    clients.forEach((client) => {
      // console.log("send to each client", client);
      client.postMessage({
        type: "TASK_UPDATE",
        task: task,
      });
    });
  } catch (callbackError) {
    console.error("Task update failed:", callbackError);
  }
}

// Function to perform the task
async function performTask(task: Task) {
  try {
    console.log(`Performing task of type: ${task.type}`);
    task.status = "executing";
    task.executedAt = new Date();
    task.instanceId = swInstanceId;
    await updateTaskInStorage(task);
    await sendTaskUpdate(task);

    let result;
    switch (task.type) {
      case "fetch":
        result = await performFetchTask(task);
        break;
      // Add other task types here
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    // Add a 10-second delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 10000 + 2000)
    );

    task.status = "complete";
    task.result = result;
    await moveTaskToCompleted(task);
    await sendTaskUpdate(task);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Task failed:", error);
      task.status = "failed";
      task.error = error.message;
      await moveTaskToCompleted(task);
      await sendTaskUpdate(task);
    } else {
      console.error("unknown error", error);
    }
  }
}

async function performFetchTask(task: Task): Promise<any> {
  if (task.type !== "fetch") {
    throw new Error("Invalid task type for performFetchTask");
  }

  const { url, method, headers, body } = task.config;
  const response = await fetch(url, {
    method: method || "GET",
    headers: headers || {},
    body: body ? JSON.stringify(body) : null,
  });

  return await response.json();
}

// Monitor the queue and perform tasks
function monitorQueue() {
  setInterval(async () => {
    const task = await getNextTask();
    if (task) {
      console.log("performing task", task);
      await performTask(task);
    }
  }, 1000); // Check every second
}

// Initialize the instance ID when the service worker starts
swInstanceId = generateInstanceId();
console.log(
  "Service Worker instance ID:",
  swInstanceId,
  "installing monitoring"
);
monitorQueue();

// Message event listener
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const data = event.data;

  if (data && data.action === "enqueue") {
    enqueueTask(data.task);
  }
});
