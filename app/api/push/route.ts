import type { NextRequest } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY ?? ""
);

// let intervalId: NodeJS.Timeout | null = null;

export async function POST(req: NextRequest) {
  const { subscription } = await req.json();

  // // 既存のインターバルがあれば停止
  // if (intervalId) {
  //   clearInterval(intervalId);
  //   intervalId = null;
  //   return Response.json({ message: "定期通知を終了しました" });
  // }

  // // 10秒おきに通知を送信
  // intervalId = setInterval(async () => {
  //   try {
  //     // プッシュ通知を送信する処理
  //     webpush.sendNotification(
  //       subscription,
  //       JSON.stringify({
  //         title: "10秒後の通知",
  //         body: "これはバックグラウンドでも届く通知です",
  //       }),
  //     );
  //     console.log("通知を送信しました:", new Date().toLocaleString());
  //   } catch (error) {
  //     console.error("通知送信エラー:", error);
  //   }
  // }, 10000);

  // return Response.json({ message: "定期通知を開始しました" });

  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: "通知テスト",
      body: "これはPWAからの通知です",
    })
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
