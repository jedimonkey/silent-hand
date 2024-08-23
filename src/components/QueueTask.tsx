"use client";

import { useEffect, useState } from "react";
import {
  ExtendableMessageData,
  Task,
  TaskUpdateMessageData,
} from "../../service-worker/types";

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
    name: "queue-test",
    // body: ,
  };

  useEffect(() => {
    const processMessage = (event: MessageEvent<TaskUpdateMessageData>) => {
      // Access the data sent from the service worker
      const data = event.data;

      // Handle the message (this is where your logic goes)
      console.log("Message received from Service Worker:", data);

      // Example: Display a notification or update the UI based on the message
      if (data.type === "TASK_UPDATE") {
        // showNotification(data.message);
        console.log("got", data);
        setDebug((prev) => [
          ...prev,
          `${data.type}: ${data.task.id} ${JSON.stringify(
            data.task.result,
            null,
            2
          )}`,
        ]);
      }
    };

    navigator.serviceWorker.addEventListener("message", processMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", processMessage);
    };
  }, []);

  const [debug, setDebug] = useState<string[]>([]);

  const queueTask = () => {
    addTaskToQueue(task);
  };

  return (
    <>
      <button
        onClick={queueTask}
        className="border rounded-md border-slate-500 font-sans p-1 grow-0"
      >
        Queue Task
      </button>
      <div>
        {debug.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
    </>
  );
};
