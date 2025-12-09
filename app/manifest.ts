/**
 * @file app/manifest.ts
 * @description PWA manifest 생성
 */

import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mini Instagram",
    short_name: "Mini IG",
    description: "Instagram 스타일의 SNS 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#0095f6",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}




