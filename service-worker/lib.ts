import { ExtendableMessageEvent, Task } from "./types";

const DB_NAME = "taskQueueDB";
const STORE_NAME = "tasks";
const COMPLETED_STORE_NAME = "completedTasks";
let db: IDBDatabase | null = null;

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
async function enqueueTask(task: Task) {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  console.log("adding task", task);
  const returnVal = store.add(task);
  console.log("enqueued", returnVal);
}

// Get and remove the next task from the queue
async function dequeueTask() {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.openCursor();

  return new Promise<any>((resolve, reject) => {
    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const task = cursor.value;
        cursor.delete(); // Remove the task from the queue
        resolve(task);
      } else {
        resolve(null); // No more tasks in the queue
      }
    };

    request.onerror = (event: Event) => {
      reject("IndexedDB error: " + (event.target as IDBRequest).error);
    };
  });
}

// Update task status in IndexedDB
async function updateTaskInStorage(updatedTask: Task) {
  const db = await openDB();
  const transaction = db.transaction(COMPLETED_STORE_NAME, "readwrite");
  const store = transaction.objectStore(COMPLETED_STORE_NAME);
  store.add(updatedTask);
}

// Function to perform the task
async function performTask(task: Task) {
  try {
    console.log("performing fetch", task.url);
    const response = await fetch(task.url, {
      method: task.method || "GET",
      headers: task.headers || {},
      body: task.body ? JSON.stringify(task.body) : null,
    });

    const result = await response.json();
    task.status = "complete";
    task.result = result;
    console.log("updated task", task);
    await updateTaskInStorage(task);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Task failed:", error);
      task.status = "failed";
      task.error = error.message;
      await updateTaskInStorage(task);
      return;
    }
    console.error("unknown error", error);
  }
}

// Monitor the queue and perform tasks
export function monitorQueue() {
  console.log("setting up monitoring queue");
  setInterval(async () => {
    const task = await dequeueTask();
    if (task) {
      console.log("performing task", task);
      await performTask(task);
    }
  }, 1000); // Check every second
}

// Message event listener
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const data = event.data;

  if (data && data.action === "enqueue") {
    console.log("got one", data.task);
    // do we have an id?

    enqueueTask(data.task);
  }
});
