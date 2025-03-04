// ======================
// components/ScrollProgressIndicator.tsx
// A cool extra feature that shows a progress bar at the top as the user scrolls.
import React, { useState, useCallback, useEffect } from "react";
import useDebounce from "../utils/useDebounce";

const ScrollProgressIndicator: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Update the scroll progress (debounced for performance)
  const updateProgress = useCallback(() => {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    setScrollProgress(progress);
  }, []);

  const debouncedUpdateProgress = useDebounce(updateProgress, 50);

  useEffect(() => {
    window.addEventListener("scroll", debouncedUpdateProgress);
    return () => window.removeEventListener("scroll", debouncedUpdateProgress);
  }, [debouncedUpdateProgress]);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div
        className="bg-[var(--color-accent)] h-full"
        style={{
          width: `${scrollProgress}%`,
          transition: "width 0.1s ease-out",
        }}
      />
    </div>
  );
};

export default ScrollProgressIndicator;
