// ThemeControls.tsx
// Updated theme control component with only contrast adjustment to ensure proportional theming.
// Removing brightness control for simplicity.
import React, { useState, useEffect } from "react";
import { trackEvent } from "../utils/analytics";

const ThemeControls: React.FC = () => {
  const [contrast, setContrast] = useState(1);

  // Update the CSS variable for contrast as the user adjusts the slider.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--contrast",
      contrast.toString()
    );
  }, [contrast]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <label
          htmlFor="contrast"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Contrast
        </label>
        <input
          id="contrast"
          type="range"
          min="0.8"
          max="1.2"
          step="0.05"
          value={contrast}
          onChange={(e) => {
            const newContrast = parseFloat(e.target.value);
            setContrast(newContrast);
            trackEvent("theme_contrast_change", { contrast: newContrast });
          }}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ThemeControls;
