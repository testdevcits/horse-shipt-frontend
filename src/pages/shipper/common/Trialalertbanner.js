import React, { useEffect, useState } from "react";
import { useSubscription } from "../../../contexts/shipperContext/SubscriptionContext";
import { AlertCircle } from "lucide-react";

const TrialAlertBanner = ({ hideButton }) => {
  const { subscription, loading } = useSubscription();
  const [timeLeft, setTimeLeft] = useState(null);

  const isTrialing = subscription && subscription.status === "trialing";

  const lessThanOneDay = subscription && subscription.remainingTrialDays <= 1;
  const shouldShow = isTrialing && lessThanOneDay;

  useEffect(() => {
    if (!shouldShow || !subscription?.trialEnd) return;

    const updateTimer = () => {
      const now = new Date();
      const trialEndDate = new Date(subscription.trialEnd);
      const diffMs = trialEndDate - now;

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [shouldShow, subscription?.trialEnd]);

  if (loading || !shouldShow || !timeLeft) return null;

  const formatTime = () =>
    `${String(timeLeft.hours).padStart(2, "0")}:${String(
      timeLeft.minutes
    ).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`;

  return (
    <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-2 mb-2">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-pulse" />
        <span className="text-xs sm:text-sm font-medium truncate">
          Trial expires in:{" "}
          <span className="font-black font-mono ml-1">{formatTime()}</span>
        </span>
      </div>
    </div>
  );
};

export default TrialAlertBanner;
