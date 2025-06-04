import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    // { status: 200, ok: true }
    { error: "アクセス拒否されました。" },
    { status: 401 }
  );
}
