import { useCallback } from "react";

export function useAudioSync() {
  const jumpToTimestamp = useCallback((timestamp: number) => {
    // Dispatch custom event that AudioPlayer listens to
    const event = new CustomEvent("audio-jump-to-time", {
      detail: { timestamp },
    });
    window.dispatchEvent(event);
  }, []);

  return { jumpToTimestamp };
}