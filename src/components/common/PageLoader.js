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
  size = 18,
  overlay = false,
  variant = "skeleton",
}) => {
  if (!fullScreen && !overlay && variant === "skeleton") {
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
  const loaderSize = size;
  const wrapperClass = overlay
    ? "absolute inset-0 z-40 min-h-full bg-white/80"
    : fullScreen
    ? "fixed inset-0 z-50 min-h-screen bg-white/90"
    : "w-full min-h-[70vh]";
  const contentClass = overlay ? "min-h-[240px] -translate-y-4" : "";
  const textClass = overlay ? "text-systemText" : "text-systemText";

  return (
    <div
      className={`flex flex-col items-center justify-center font-montserrat text-center ${wrapperClass}`}
    >
      <div className={`flex flex-col items-center ${contentClass}`}>
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

        {text && (
          <p className={`mt-4 text-sm sm:text-base ${textClass}`}>{text}</p>
        )}
      </div>
    </div>
  );
};

export default PageLoader;
