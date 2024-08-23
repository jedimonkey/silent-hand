import withWorkbox from "next-with-workbox";

/** @type {import('next').NextConfig} */
const nextConfig = withWorkbox({
  workbox: {
    swSrc: "service-worker/service-worker.ts",
    swDest: "sw.js",
    // clientsClaim: true,
    // skipWaiting: true,
    force: true,
  },
  webpack(config, options) {
    // Custom Webpack config (if any)
    return config;
  },
});

export default nextConfig;
