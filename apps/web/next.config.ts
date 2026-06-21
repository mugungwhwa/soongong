import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["tldraw"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/apps/web/public/mascot/:path*",
          destination: "/mascot/:path*",
        },
        {
          source: "/apps/web/public/brand/:path*",
          destination: "/brand/:path*",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    // @supabase/realtime-js (pulled in via @supabase/ssr → supabase-js) references
    // the browser global `self` at module load. In the production server/edge
    // middleware bundle `self` is undefined → "ReferenceError: self is not defined".
    // Prepend a safe polyfill so `self` resolves to globalThis on the server.
    if (isServer) {
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: "globalThis.self = globalThis.self || globalThis;",
          raw: true,
          entryOnly: false,
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
