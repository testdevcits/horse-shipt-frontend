import React from "react";
import ReactDOM from "react-dom/client";
import "./api/installAxiosRequestCache";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        // Optional: listen for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              // Service worker update state is handled silently.
            }
          };
        };
      })
      .catch((err) =>
        console.error("Service Worker registration failed:", err)
      );
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
