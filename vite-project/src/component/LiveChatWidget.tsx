import React from "react";

const LiveChatWidget: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-[var(--color-primary)] shadow-lg rounded p-4 transition-transform duration-300 hover:scale-105">
      <h4 className="text-lg font-bold">Live Chat</h4>
      <p className="text-sm">How can we help you?</p>
      {/* Replace with your actual chat widget code */}
      <button
        className="mt-2 px-3 py-1 bg-green-500 text-[var(--color-primary)] rounded hover:bg-green-600 transition-colors"
        onClick={() => alert("Chat initiated")}
      >
        Start Chat
      </button>
    </div>
  );
};

export default LiveChatWidget;
