const debounce = (func: Function, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

export const trackEvent = debounce(
  (eventName: string, details: Record<string, any>) => {
    try {
      const metadata = {
        ...details,
        deviceType: window.innerWidth < 768 ? "mobile" : "desktop",
        sessionId: sessionStorage.getItem("sessionId") || "unknown",
      };
      if (window.gtag) {
        window.gtag("event", eventName, metadata);
      } else {
        console.log(`Tracked Event: ${eventName}`, metadata);
      }
    } catch (error) {
      console.error("Analytics tracking error:", error, eventName, details);
    }
  },
  300
);
