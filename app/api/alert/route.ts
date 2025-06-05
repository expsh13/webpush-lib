import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: 200, ok: true }
    // { error: "アクセス拒否されました。" },
    // { status: 401 }
  );
}
