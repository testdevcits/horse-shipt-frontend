export const getPublishedTime = (publishedAt) => {
  if (!publishedAt) return "Not published yet";

  const now = new Date();
  const published = new Date(publishedAt);

  const diffMs = now - published;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  // Less than 60 minutes
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }

  // Less than 6 hours (you can change this limit)
  if (diffHours < 6) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  // Otherwise show date
  return published.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
