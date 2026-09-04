import { API_BASE_URL } from "../config/api";
const MAX_NOTIFICATIONS = 50;
const DEFAULT_CACHE_MS = 12000;
const activityCache = new Map();
const pendingRequests = new Map();

const getActivityPath = (role) => {
  if (role === "customer") return "customer/notification-activity";
  if (role === "shipper") return "shipper/notification-activity";
  return null;
};

const normalizeServerNotification = (item) => ({
  id: item._id || item.id,
  type: item.type || "notification",
  title: item.title || "Notification",
  message: item.message,
  event: item.event,
  data: item.data,
  createdAt: item.createdAt,
  read: Boolean(item.read),
});

const getNotificationEntityId = (notification = {}) =>
  notification.data?.quote?._id ||
  notification.data?.quoteId ||
  notification.data?.question?._id ||
  notification.data?.questionId ||
  notification.data?.shipmentId ||
  notification.data?._id;

const getNotificationDedupeKey = (notification = {}) => {
  const entityId = getNotificationEntityId(notification);
  const type = notification.type || notification.event || "notification";
  if (entityId) return `${type}:${entityId}`;

  return [
    type,
    notification.event || "",
    notification.title || "",
    notification.message || "",
    notification.createdAt || "",
  ].join(":");
};

const getCacheKey = ({ role, userId }) =>
  role && userId ? `${role}:${userId}` : null;

const getFallbackActivity = ({ role, userId }) => {
  const notifications = loadNotificationActivity({ role, userId });
  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
  };
};

const setActivityCache = ({ role, userId, value }) => {
  const cacheKey = getCacheKey({ role, userId });
  if (!cacheKey) return;
  activityCache.set(cacheKey, {
    value,
    fetchedAt: Date.now(),
  });
};

export const invalidateNotificationActivityCache = ({ role, userId } = {}) => {
  const cacheKey = getCacheKey({ role, userId });
  if (cacheKey) {
    activityCache.delete(cacheKey);
    pendingRequests.delete(cacheKey);
    return;
  }

  activityCache.clear();
  pendingRequests.clear();
};

export const getNotificationStorageKey = ({ role, userId }) => {
  if (!role || !userId) return null;
  return `horseShiptNotifications:${role}:${userId}`;
};

export const loadNotificationActivity = ({ role, userId }) => {
  const key = getNotificationStorageKey({ role, userId });
  if (!key) return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveNotificationActivity = ({ role, userId, notification }) => {
  const key = getNotificationStorageKey({ role, userId });
  if (!key || !notification?.message) return [];

  const existing = loadNotificationActivity({ role, userId });
  const createdAt = notification.createdAt || new Date().toISOString();
  const entityId = getNotificationEntityId(notification);
  const id =
    notification.id ||
    (entityId && `${notification.type || notification.event}:${entityId}`) ||
    `${notification.event || notification.type || "notification"}:${createdAt}`;

  const next = [
    {
      id,
      type: notification.type || "notification",
      title: notification.title || "Notification",
      message: notification.message,
      event: notification.event,
      data: notification.data,
      createdAt,
      read: false,
    },
    ...existing.filter((item) => item.id !== id),
  ].slice(0, MAX_NOTIFICATIONS);

  localStorage.setItem(key, JSON.stringify(next));
  setActivityCache({
    role,
    userId,
    value: {
      notifications: next,
      unreadCount: next.filter((item) => !item.read).length,
    },
  });
  return next;
};

export const markNotificationActivityRead = ({ role, userId }) => {
  const key = getNotificationStorageKey({ role, userId });
  if (!key) return [];

  const next = loadNotificationActivity({ role, userId }).map((item) => ({
    ...item,
    read: true,
  }));

  localStorage.setItem(key, JSON.stringify(next));
  setActivityCache({
    role,
    userId,
    value: {
      notifications: next,
      unreadCount: 0,
    },
  });
  return next;
};

export const fetchNotificationActivity = async ({
  role,
  userId,
  token,
  force = false,
  cacheMs = DEFAULT_CACHE_MS,
} = {}) => {
  const path = getActivityPath(role);
  if (!path || !token) {
    return getFallbackActivity({ role, userId });
  }

  const cacheKey = getCacheKey({ role, userId });
  const cached = cacheKey ? activityCache.get(cacheKey) : null;

  if (
    !force &&
    cached &&
    Date.now() - cached.fetchedAt < cacheMs
  ) {
    return cached.value;
  }

  if (!force && cacheKey && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = (async () => {
    const res = await fetch(`${API_BASE_URL}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch notifications");

    const json = await res.json();
    const serverNotifications = (json.data || []).map(normalizeServerNotification);
    const localNotifications = loadNotificationActivity({ role, userId });
    const seen = new Set();
    const notifications = [...serverNotifications, ...localNotifications]
      .filter((item) => {
        const dedupeKey = getNotificationDedupeKey(item);
        if (!item?.id || seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, MAX_NOTIFICATIONS);

    const key = getNotificationStorageKey({ role, userId });
    if (key) localStorage.setItem(key, JSON.stringify(notifications));

    const value = {
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
    };

    setActivityCache({ role, userId, value });
    return value;
  })();

  if (cacheKey) {
    pendingRequests.set(cacheKey, request);
  }

  try {
    return await request;
  } finally {
    if (cacheKey) pendingRequests.delete(cacheKey);
  }
};

export const markNotificationActivityReadRemote = async ({
  role,
  userId,
  token,
  ids = [],
}) => {
  const selectedIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
  if (selectedIds.length) {
    const key = getNotificationStorageKey({ role, userId });
    if (key) {
      const next = loadNotificationActivity({ role, userId }).map((item) =>
        selectedIds.includes(item.id) ? { ...item, read: true } : item
      );
      localStorage.setItem(key, JSON.stringify(next));
      setActivityCache({
        role,
        userId,
        value: {
          notifications: next,
          unreadCount: next.filter((item) => !item.read).length,
        },
      });
    }
  } else {
    markNotificationActivityRead({ role, userId });
  }

  const path = getActivityPath(role);
  if (!path || !token) return;
  invalidateNotificationActivityCache({ role, userId });

  await fetch(`${API_BASE_URL}/${path}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(selectedIds.length ? { ids: selectedIds } : {}),
  });
};

export const deleteNotificationActivity = async ({
  role,
  userId,
  token,
  notificationId,
}) => {
  const key = getNotificationStorageKey({ role, userId });
  if (key) {
    const next = loadNotificationActivity({ role, userId }).filter(
      (item) => item.id !== notificationId
    );
    localStorage.setItem(key, JSON.stringify(next));
  }
  invalidateNotificationActivityCache({ role, userId });

  const path = getActivityPath(role);
  if (!path || !token || !notificationId) return;
  if (!/^[a-f\d]{24}$/i.test(notificationId)) return;

  const res = await fetch(
    `${API_BASE_URL}/${path}/${encodeURIComponent(notificationId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to delete notification");
};

export const deleteNotificationActivities = async ({
  role,
  userId,
  token,
  ids = [],
  all = false,
}) => {
  const selectedIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
  const key = getNotificationStorageKey({ role, userId });

  if (key) {
    const next = all
      ? []
      : loadNotificationActivity({ role, userId }).filter(
          (item) => !selectedIds.includes(item.id)
        );
    localStorage.setItem(key, JSON.stringify(next));
  }

  invalidateNotificationActivityCache({ role, userId });

  const path = getActivityPath(role);
  if (!path || !token || (!all && selectedIds.length === 0)) return;

  const serverIds = selectedIds.filter((id) => /^[a-f\d]{24}$/i.test(id));
  if (!all && serverIds.length === 0) return;

  const res = await fetch(`${API_BASE_URL}/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(all ? { all: true } : { ids: serverIds }),
  });

  if (!res.ok) throw new Error("Failed to delete notifications");
};
