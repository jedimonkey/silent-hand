import { ExtendableMessageEvent, Task, TaskConfig } from "./types";

const DB_NAME = "taskQueueDB";
const STORE_NAME = "tasks";
const COMPLETED_STORE_NAME = "completedTasks";
let db: IDBDatabase | null = null;

let swInstanceId: string;

function generateInstanceId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Open IndexedDB
function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      db.createObjectStore(COMPLETED_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    };

    request.onsuccess = (event: Event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      reject("IndexedDB error: " + (event.target as IDBOpenDBRequest).error);
    };
  });
}

// Add task to queue in IndexedDB
async function enqueueTask(task: TaskConfig) {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const now = new Date().toISOString();
  const taskWithDates = {
    ...task,
    createdAt: now,
    updatedAt: now,
    executedAt: null,
    status: "pending",
  };
  console.log("adding task", taskWithDates);
  const returnVal = store.add(taskWithDates);
  console.log("enqueued", returnVal);
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
  updatedTask.updatedAt = new Date().toISOString();
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

  await taskStore.delete(task.id);
  await completedStore.add(task);
}

// Send task update to all clients
async function sendTaskUpdate(task: Task) {
  try {
    const clients = await (
      self as unknown as ServiceWorkerGlobalScope
    ).clients.matchAll();
    clients.forEach((client) => {
      console.log("send to each client", client);
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
    console.log("performing fetch", task.url);
    task.status = "executing";
    task.executedAt = new Date().toISOString();
    task.instanceId = swInstanceId;
    await updateTaskInStorage(task);
    await sendTaskUpdate(task);

    const response = await fetch(task.url, {
      method: task.method || "GET",
      headers: task.headers || {},
      body: task.body ? JSON.stringify(task.body) : null,
    });

    const result = await response.json();

    // Add a 10-second delay
    await new Promise((resolve) => setTimeout(resolve, 10000));

    task.status = "complete";
    task.result = result;
    console.log("updated task", task);
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

// Monitor the queue and perform tasks
export function monitorQueue() {
  console.log("setting up monitoring queue");
  setInterval(async () => {
    const task = await getNextTask();
    if (task) {
      console.log("performing task", task);
      await performTask(task);
    }
  }, 1000); // Check every second
}

// Initialize the instance ID when the service worker starts
self.addEventListener("install", (event) => {
  swInstanceId = generateInstanceId();
  console.log("Service Worker instance ID:", swInstanceId);
});

// Message event listener
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const data = event.data;

  if (data && data.action === "enqueue") {
    console.log("got one", data.task);
    enqueueTask(data.task);
  }
});
