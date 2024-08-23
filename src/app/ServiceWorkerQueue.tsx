"use client";
import { useEffect } from "react";
import { Workbox } from "workbox-window";

export const ServiceWorkerQueue = () => {
  useEffect(() => {
    console.log("boot strapping");
    if (
      !("serviceWorker" in navigator) // ||
      // process.env.NODE_ENV !== "production"
    ) {
      console.warn("Pwa support is disabled");
      return;
    }

    const wb = new Workbox("/sw.js", { scope: "/" });
    wb.register();

    // if ("serviceWorker" in navigator) {
    //   window.addEventListener("load", () => {
    //     console.log("loadig");
    //     navigator.serviceWorker
    //       .register("/static/service-worker.js")
    //       .then((registration) => {
    //         console.log(
    //           "Service Worker registered with scope:",
    //           registration.scope
    //         );
    //       })
    //       .catch((error) => {
    //         console.error("Service Worker registration failed:", error);
    //       });
    //   });
    // } else {
    //   console.log("Service worker not supported");
    // }
  }, []);
  return null;
};
