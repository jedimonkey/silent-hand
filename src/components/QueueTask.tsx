"use client";

import { ExtendableMessageData, TaskConfig } from "../service-worker/types";

function addTaskToQueue(task: TaskConfig) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: "enqueue",
      task: task,
    } as ExtendableMessageData);
  } else {
    console.error("No active service worker found to handle the request.");
  }
}

export const QueueTask = () => {
  // Example usage:
  const task: TaskConfig = {
    type: "fetch",
    config: {
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      name: "queue-test",
      //  body: ,
    },
  };

  const queueTask = () => {
    addTaskToQueue(task);
  };

  return (
    <button
      onClick={queueTask}
      className="border rounded-md border-slate-500 font-sans p-1 grow-0"
    >
      Queue Task
    </button>
  );
};
