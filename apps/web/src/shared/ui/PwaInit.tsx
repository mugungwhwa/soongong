"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/shared/lib/pwa/register-sw";

export function PwaInit() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
