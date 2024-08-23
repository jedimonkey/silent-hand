"use client";
import { useEffect } from "react";
import { Workbox } from "workbox-window";

export const ServiceWorkerQueue = () => {
  useEffect(() => {
    if (
      !("serviceWorker" in navigator) // ||
      // process.env.NODE_ENV !== "production"
    ) {
      console.warn("Pwa support is disabled");
      return;
    }

    const wb = new Workbox("/sw.js", { scope: "/" });
    wb.register();
  }, []);
  return null;
};
