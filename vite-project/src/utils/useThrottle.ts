// Custom throttle hook to limit how frequently a function executes.
// Fine-tuned for smoother animations on lower-end devices.
import { useRef, useCallback } from "react";

const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastCall = useRef(0);
  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      }
    },
    [callback, delay]
  );
};

export default useThrottle;
