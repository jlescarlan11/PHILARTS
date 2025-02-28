// index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css"; // Ensure your Tailwind CSS is imported

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
