import React from "react";
import "../Loader.css";
import {
  ArticleSkeleton,
  ChatSkeleton,
  DashboardSkeleton,
  DetailSkeleton,
  ListPanelSkeleton,
  OpportunityListSkeleton,
  PageSkeleton,
  PanelSkeleton,
  ShipperGridSkeleton,
} from "./Skeleton";

const PageLoader = ({
  text = "Loading...",
  fullScreen = false,
  color = "#BF9B53",
  variant = "skeleton",
}) => {
  if (!fullScreen && variant === "skeleton") {
    const lowerText = String(text || "").toLowerCase();

    if (lowerText.includes("detail") || lowerText.includes("profile")) {
      return <DetailSkeleton />;
    }

    if (
      lowerText.includes("top rated shipper") ||
      lowerText.includes("matching shipper") ||
      lowerText.includes("shipper")
    ) {
      return <ShipperGridSkeleton />;
    }

    if (
      lowerText.includes("quote") ||
      lowerText.includes("question") ||
      lowerText.includes("notification") ||
      lowerText.includes("review")
    ) {
      return <ListPanelSkeleton />;
    }

    if (
      lowerText.includes("billing") ||
      lowerText.includes("payment") ||
      lowerText.includes("payout") ||
      lowerText.includes("settings") ||
      lowerText.includes("vehicle") ||
      lowerText.includes("driver") ||
      lowerText.includes("horse")
    ) {
      return <PanelSkeleton />;
    }

    if (lowerText.includes("opportunit") || lowerText.includes("shipment")) {
      return <OpportunityListSkeleton />;
    }

    if (lowerText.includes("chat") || lowerText.includes("message")) {
      return <ChatSkeleton />;
    }

    if (
      lowerText.includes("terms") ||
      lowerText.includes("privacy") ||
      lowerText.includes("policy")
    ) {
      return <ArticleSkeleton />;
    }

    if (!text) {
      return <DashboardSkeleton />;
    }

    return <PageSkeleton />;
  }

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
