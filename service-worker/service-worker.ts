import { precacheAndRoute } from "workbox-precaching/precacheAndRoute";
import { ExtendableMessageEvent, Task } from "./types";
import { randomUUID } from "crypto";
import { monitorQueue } from "./lib";

// public/service-worker.ts

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: string[];
  }
}

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

precacheAndRoute(self.__WB_MANIFEST);
// IndexedDB setup

// Start monitoring the queue
monitorQueue();
