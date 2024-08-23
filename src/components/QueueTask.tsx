"use client";

import { useState } from "react";
import { ExtendableMessageData, Task } from "../../service-worker/types";

function addTaskToQueue(task: Task) {
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
  const task: Task = {
    url: "https://jsonplaceholder.typicode.com/todos/1",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // body: ,
  };

  const [debug, setDebug] = useState<string[]>([]);

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
