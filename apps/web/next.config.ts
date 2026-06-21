import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["tldraw"],
  // Prototype HTML files in public/p/soo-*/index.html reference mascot assets via
  // "../../../apps/web/public/mascot/" (3 levels up from docs/prototypes/ in the source repo).
  // When served at /p/soo-*/index.html on Vercel, that path resolves to
  // /apps/web/public/mascot/* in the browser. This beforeFiles rewrite transparently
  // maps those requests to the actual /mascot/* static assets without modifying the HTML.
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
