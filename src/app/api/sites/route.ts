import { NextRequest, NextResponse } from "next/server";
import { publicError, searchSites } from "@/lib/freeserp/client";
import {
  InvalidParametersError,
  parseFilters,
  parseOffset,
} from "@/lib/freeserp/query";

export async function GET(request: NextRequest) {
  try {
    const filters = parseFilters(request.nextUrl.searchParams, true);
    const data = await searchSites(
      filters,
      parseOffset(request.nextUrl.searchParams),
    );
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    if (error instanceof InvalidParametersError) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "invalid_parameters", message: error.message },
        },
        { status: 400 },
      );
    }
    const result = publicError(error);
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }
}
