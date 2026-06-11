import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["tldraw"],
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
