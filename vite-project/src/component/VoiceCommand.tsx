// ======================
// components/VoiceCommand.tsx
// Placeholder component for voice command integration.
// In production, integrate a library like annyang or react-speech-recognition.
import React from "react";
import { trackEvent } from "../utils/analytics";

const VoiceCommand: React.FC = () => {
  const activateVoiceCommands = () => {
    trackEvent("voice_command_activated", { status: "activated" });
    alert("Voice commands activated! (This is a placeholder)");
  };

  return (
    <button
      onClick={activateVoiceCommands}
      title="Activate Voice Commands"
      className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
        hover:bg-[var(--color-accent)] transition-colors duration-300"
    >
      🎤
    </button>
  );
};

export default VoiceCommand;
