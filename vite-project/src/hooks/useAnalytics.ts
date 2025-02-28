import { useCallback } from "react";

const useAnalytics = () => {
  const trackEvent = useCallback(
    (eventName: string, params?: Record<string, any>) => {
      // Replace with your full-featured analytics integration (e.g., GA4, Segment)
      if (window && (window as any).gtag) {
        (window as any).gtag("event", eventName, params);
      } else {
        console.log("Analytics Event:", eventName, params);
      }
    },
    []
  );

  return { trackEvent };
};

export default useAnalytics;
