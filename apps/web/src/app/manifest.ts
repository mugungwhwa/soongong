import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "순공대장",
    short_name: "순공대장",
    description: "수능생 듀오링고형 AI 회독 리텐션 엔진",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FBF7",
    theme_color: "#A8DCCB",
    orientation: "portrait",
    lang: "ko",
    categories: ["education"],
    icons: [
      {
        src: "/brand/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
