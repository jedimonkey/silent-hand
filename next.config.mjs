import withWorkbox from "next-with-workbox";

/** @type {import('next').NextConfig} */
const nextConfig = withWorkbox({
  workbox: {
    swSrc: "service-worker/service-worker.ts",
    swDest: "sw.js",
    // clientsClaim: true,
    // skipWaiting: true,
    force: true,
    exclude: [/^app-build-manifest\.json$/, /^server\/.*/],
  },
  webpack(config, options) {
    // Custom Webpack config (if any)
    return config;
  },
});

export default nextConfig;
