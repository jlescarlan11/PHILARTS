// Advanced analytics stub. Extend this module to integrate mobile-specific features
// such as heatmaps or scroll tracking as needed.
export const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
    if (window.gtag) {
      window.gtag("event", eventName, details);
    } else {
      console.warn("Analytics not available", eventName, details);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error, eventName, details);
  }
};
