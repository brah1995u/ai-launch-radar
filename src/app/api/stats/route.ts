import { NextResponse } from "next/server";
import { getStats, publicError } from "@/lib/freeserp/client";

export async function GET() {
  try {
    return NextResponse.json(
      { ok: true, data: await getStats() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    const result = publicError(error);
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }
}
