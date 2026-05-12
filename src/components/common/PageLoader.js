import React from "react";
import "../Loader.css";

const PageLoader = ({
  text = "Loading...",
  fullScreen = false,
  color = "#BF9B53",
}) => {
  const cubes = Array.from({ length: 9 });
  const loaderSize = 18;

  return (
    <div
      className={`flex flex-col items-center justify-center font-montserrat text-center ${
        fullScreen
          ? "fixed inset-0 z-50 min-h-screen bg-white/90"
          : "w-full min-h-[70vh]"
      }`}
    >
      {/* Cube Grid Loader */}
      <div
        className={fullScreen ? "cube-loader-fullscreen" : "cube-loader-root"}
        style={{ "--cube-size": `${loaderSize}px`, "--cube-color": color }}
      >
        <span className="sr-only">Loading…</span>
        <div className="cube-grid">
          {cubes.map((_, i) => (
            <div
              key={i}
              className="cube"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      {/* Loader Text */}
      {text && (
        <p className="mt-4 text-systemText text-sm sm:text-base">{text}</p>
      )}
    </div>
  );
};

export default PageLoader;
