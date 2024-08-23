"use client";

import { useEffect, useState } from "react";
import {
  ExtendableMessageData,
  Task,
  TaskConfig,
  TaskUpdateMessageData,
} from "../service-worker/types";

export const QueueLogger = () => {
  useEffect(() => {
    const processMessage = (event: MessageEvent<TaskUpdateMessageData>) => {
      // Access the data sent from the service worker
      const data = event.data;

      // Handle the message (this is where your logic goes)
      console.log("Message received from Service Worker:", data);

      // Example: Display a notification or update the UI based on the message
      if (data.type === "TASK_UPDATE") {
        // showNotification(data.message);
        setDebug((prev) => [
          ...prev,
          `${data.type}: ${data.task.id} (${data.task.status}) ${
            data.task.result ? JSON.stringify(data.task.result, null, 2) : ""
          }`,
        ]);
      }
    };

    navigator.serviceWorker.addEventListener("message", processMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", processMessage);
    };
  }, []);

  const [debug, setDebug] = useState<string[]>([]);

  return (
    <>
      <div>
        {debug.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
    </>
  );
};
