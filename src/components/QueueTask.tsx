"use client";

import { useState } from "react";
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
  const [sleepDuration, setSleepDuration] = useState(1);
  const [canRetry, setCanRetry] = useState(false);

  const task: TaskConfig = {
    type: "fetch",
    config: {
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      name: "queue-test",
    },
    canRetry: canRetry,
  };

  const queueFetch = () => {
    addTaskToQueue(task);
  };

  const queueSleep = () => {
    addTaskToQueue({
      type: "sleep",
      config: {
        duration: sleepDuration * 1000,
      },
      canRetry: canRetry,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-1">
      <button
        onClick={queueFetch}
        className="border rounded-md border-slate-500 font-sans p-1 grow-0"
      >
        Queue Fetch
      </button>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={sleepDuration}
          onChange={(e) => setSleepDuration(Number(e.target.value))}
          className="border rounded-md border-slate-500 font-sans p-1 grow-0 w-16"
          min="1"
        />
        <button
          onClick={queueSleep}
          className="border rounded-md border-slate-500 font-sans p-1 grow-0"
        >
          Queue Sleep
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={canRetry}
          onChange={(e) => setCanRetry(e.target.checked)}
          id="canRetry"
        />
        <label htmlFor="canRetry">Can Retry</label>
      </div>
    </div>
  );
};
