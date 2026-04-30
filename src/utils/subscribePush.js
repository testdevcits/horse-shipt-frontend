import axios from "axios";

export const subscribeUser = async (token) => {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.REACT_APP_VAPID_PUBLIC_KEY
    ),
  });

  // Send subscription to backend
  await axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/customer/notifications/subscribe`,
    { subscription },
    { headers: { Authorization: `Bearer ${token}` } }
  );

 
};

// Convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
