self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      // 通知が表示される際に本文の横に表示される画像
      icon: data.icon || "/vercel.svg",
      actions: [
        { action: "open", title: "画面を見る" },
        { action: "completed", title: "対応完了" },
      ],
      badge: "/badge.png",
      vibrate: [200, 100, 200, 100, 200], // バイブパターン（Android用）
      data: {
        dateOfArrival: Date.now(),
      },
      requireInteraction: true,
    };
    // ブラウザ上にプッシュ通知
    event.waitUntil(self.registration.showNotification(data.title, options));

    // フロントエンドへ送信
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          client.postMessage({
            type: "PUSH_RECEIVE",
            payload: {
              alert: true,
            },
          });
        }
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "completed") {
    // TODO: 再通知しないAPIとそのエラー対応
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          client.postMessage({
            type: "PUSH_STOP_RECEIVE",
            payload: {
              // TODO: 居室番号動的にを変更する
              roomNum: 202,
            },
          });
        }
      })
    );
  } else if (event.action === "open") {
    event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
  } else {
    event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
  }
});
