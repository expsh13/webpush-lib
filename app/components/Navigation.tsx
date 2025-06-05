"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSpNavigation } from "../store";

type MessageEventData = {
  type: string;
  payload: { alert: boolean };
};

interface ServiceWorkerMessageEvent extends MessageEvent {
  data: MessageEventData;
}

type StopEventData = {
  type: string;
  payload: { roomNum: number };
};

interface ServiceWorkerStopEvent extends MessageEvent {
  data: StopEventData;
}

// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1725
type NotificationAction = {
  action: string;
  title: string;
};
interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: NotificationAction[];
  vibrate?: number | number[];
}
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  showNotification: (
    title: string,
    options?: ExtendedNotificationOptions
  ) => Promise<void>;
}

export const Navigation = () => {
  const { isAlert, setIsAlert } = useSpNavigation();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setIsAlert(false);
    } catch {
      // 共通パーツのエラーなのでリダイレクト
      router.push("/login");
    }
  }, [setIsAlert, router]);

  // webプッシュ通知
  useEffect(() => {
    const handle = (e: ServiceWorkerMessageEvent) => {
      if (e.data.type === "PUSH_RECEIVE") {
        // TODO:バックランドでの検証まだ
        setIsAlert(true);
      }
    };
    navigator.serviceWorker.addEventListener("message", handle);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handle);
    };
  }, [setIsAlert]);

  // 再通知の停止
  useEffect(() => {
    const handle = async (e: ServiceWorkerStopEvent) => {
      if (e.data.type === "PUSH_STOP_RECEIVE") {
        const roomNum = e.data.payload.roomNum;
        try {
          await fetch("/api/stopPush", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ roomNum }),
          });
        } catch {
          console.log("サーバーエラー");
          if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;
            (
              registration as ExtendedServiceWorkerRegistration
            ).showNotification("再度「対応完了」を押してください", {
              body: `${roomNum}号室について、通信に失敗しました。\n恐れ入りますが再度「対応完了」を押してください。`,
              icon: "/vercel.svg",
              actions: [
                { action: "open", title: "画面を見る" },
                { action: "completed", title: "対応完了" },
              ],
              badge: "/vercel.svg",
              vibrate: [200, 100, 200, 100, 200], // バイブパターン（Android用）
              data: {
                dateOfArrival: Date.now(),
              },
              requireInteraction: true,
            });
          }
        }
      }
    };
    navigator.serviceWorker.addEventListener("message", handle);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handle);
    };
  }, [setIsAlert]);

  // ポーリング処理
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAlert) {
      intervalId = setInterval(fetchData, 60000);
    }
    return () => clearInterval(intervalId);
  }, [fetchData, isAlert]);

  return isAlert ? (
    <p className="text-red-600">アラートがあります</p>
  ) : (
    <p>アラートはありません</p>
  );
};
