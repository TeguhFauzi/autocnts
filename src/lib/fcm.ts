"use client";

import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase";

export async function initFcm(): Promise<string | null> {
    if (typeof window === "undefined" || !isFirebaseConfigured) return null;
    try {
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.warn("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY belum di-set, push token dilewati.");
            return null;
        }
        const { initializeApp, getApps } = await import("firebase/app");
        const { getMessaging, getToken, onMessage } = await import("firebase/messaging");
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("[FCM] Permission not granted");
            return null;
        }
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
        console.log("[FCM] token:", token);
        onMessage(messaging, (payload) => {
            const { title, body } = payload.notification || {};
            if (title) new Notification(title, { body });
        });
        return token;
    } catch (err) {
        console.warn("[FCM] init gagal:", err);
        return null;
    }
}
