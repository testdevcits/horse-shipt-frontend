import React from "react";

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const sameDay = (left, right) =>
  left && right && left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() && left.getDate() === right.getDate();

export function getChatDateLabel(value, previousValue, now = new Date()) {
  const date = parseDate(value);
  if (!date || sameDay(date, parseDate(previousValue))) return null;
  if (sameDay(date, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ChatDateSeparator({ message, previousMessage }) {
  const label = getChatDateLabel(message.createdAt || message.time,
    previousMessage?.createdAt || previousMessage?.time);
  if (!label) return null;
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-full border border-[#BF9B53]/20 bg-[#F6EFDF] px-3 py-1 text-xs font-medium text-[#80652F]">
        {label}
      </span>
    </div>
  );
}
