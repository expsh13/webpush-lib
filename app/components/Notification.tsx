"use client";

import { useState, useEffect } from "react";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const Notification = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  useEffect(() => {
    // ブラウザでのサポート確認
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  // サービスワーカー登録
  const registerServiceWorker = async () => {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  };

  // プッシュ通知の購読
  const subscribeToPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const _subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
      ),
    });
    setSubscription(_subscription);

    // サーバーへ送信
    await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: _subscription }),
    });
  };

  // 購読削除
  const unsubscribeFromPush = async () => {
    await subscription?.unsubscribe();
    setSubscription(null);
  };

  // メッセージ送信
  // const sendTestNotification = async () => {
  //   if (subscription) {
  //     await sendNotification(message);
  //     setMessage("");
  //   }
  // };

  if (!isSupported) {
    return <p>ご使用のブラウザは通知に対応しておりません。</p>;
  }

  return (
    <div>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button type="button" onClick={unsubscribeFromPush}>
            Unsubscribe
          </button>
          <br />
          <button type="button" onClick={subscribeToPush}>
            通知を送信
          </button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button type="button" onClick={subscribeToPush}>
            Subscribe
          </button>
        </>
      )}
    </div>
  );
};
