// Dark mode toggle component with a button to activate additional theme customization.
import React from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { trackEvent } from "../utils/analytics";

interface DarkModeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  darkMode,
  toggleDarkMode,
}) => {
  return (
    <button
      onClick={() => {
        toggleDarkMode();
        trackEvent("toggle_dark_mode", { darkMode: !darkMode });
      }}
      title="Toggle dark mode"
      aria-pressed={darkMode}
      className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
        hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300"
    >
      {darkMode ? (
        <MdLightMode className="w-6 h-6" />
      ) : (
        <MdDarkMode className="w-6 h-6" />
      )}
    </button>
  );
};

export default DarkModeToggle;
