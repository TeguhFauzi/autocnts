// Firebase Cloud Messaging service worker (config di-mirror dari .env yang sama)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyATC5dsxdVwxIoLw39FCdbqUB4rr-WoMeE",
    authDomain: "fire-test-f786f.firebaseapp.com",
    projectId: "fire-test-f786f",
    storageBucket: "fire-test-f786f.firebasestorage.app",
    messagingSenderId: "583637018334",
    appId: "1:583637018334:web:8a8ec096f94fee8da8444f",
    measurementId: "G-LN1X7J9L68",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || "Notifikasi", {
        body: body || "",
        icon: "/images/ac-logo.png",
    });
});
