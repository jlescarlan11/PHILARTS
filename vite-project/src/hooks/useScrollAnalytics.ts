import { useEffect } from "react";
import useAnalytics from "./useAnalytics";

const useScrollAnalytics = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / document.body.scrollHeight) * 100
      );
      trackEvent("scroll_depth", { scrollDepth });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [trackEvent]);
};

export default useScrollAnalytics;
