// File: useExitIntent.ts
import { useEffect } from "react";

export function useExitIntent(callback: () => void) {
  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      // Trigger callback if user’s cursor leaves from the top of the viewport
      if (event.clientY <= 0) {
        callback();
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [callback]);
}
