// A debounce hook to delay rapid event triggers, ensuring smoother UI interactions.
import { useRef, useCallback } from "react";

const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

export default useDebounce;
