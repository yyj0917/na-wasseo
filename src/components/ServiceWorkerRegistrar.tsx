"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {/* sw 등록 실패 시 무시 — PWA 기능만 비활성화 */});
    }
  }, []);

  return null;
}
