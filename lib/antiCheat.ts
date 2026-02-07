"use client";
import { useEffect } from "react";
import * as api from "./api";

export function reportEvent(testLink: string, type: string, payload: any = {}) {
  try {
    void api.sendCandidateEvent(testLink, type, payload).catch(() => {
      // Ignore logging failures; UI should not crash if the endpoint is missing.
    });
  } catch (e) {
    // swallow
  }
}

export function useAntiCheat({
  onViolation,
}: {
  onViolation?: (type: string) => void;
}) {
  useEffect(() => {
    function visibility(e: Event) {
      if (document.hidden) {
        onViolation?.("TAB_SWITCH");
      }
    }

    function blur() {
      onViolation?.("WINDOW_BLUR");
    }

    function keydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v")) {
        onViolation?.("COPY_PASTE");
      }
    }

    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("keydown", keydown);

    return () => {
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("keydown", keydown);
    };
  }, [onViolation]);
}
