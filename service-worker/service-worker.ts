import { precacheAndRoute } from "workbox-precaching/precacheAndRoute";
import { ExtendableMessageEvent, Task } from "./types";
import { randomUUID } from "crypto";
import "./lib";

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

const precache = [];
precache.push(...self.__WB_MANIFEST);
console.log("precache", process.env.NODE_ENV !== "development" ? precache : []);
// precacheAndRoute([]);
precacheAndRoute(process.env.NODE_ENV !== "development" ? precache : []);
// IndexedDB setup

// Start monitoring the queue
// monitorQueue();
