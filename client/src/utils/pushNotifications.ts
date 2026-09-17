import apiClient from "../api/client";
import { isIosDevice, isStandalonePwa } from "./platform";

export const isIos = isIosDevice;
export const isInStandaloneMode = isStandalonePwa;

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function subscribeToPush(token: string | null): Promise<boolean> {
  if (!token) return false;

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const registration = await navigator.serviceWorker.register("/push-sw.js");

    const { data } = await apiClient.get<{ publicKey: string }>("/push/vapid-public-key");

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });

    const subscriptionJson = subscription.toJSON();

    await apiClient.post(
      "/push/subscribe",
      {
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys?.p256dh,
          auth: subscriptionJson.keys?.auth,
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return true;
  } catch (err) {
    console.error("Failed to subscribe to push notifications:", err);
    return false;
  }
}
