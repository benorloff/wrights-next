import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
) {
  const { searchParams } = new URL(req.url);
  const start = parseInt(searchParams.get("start")!);
  const limit = parseInt(searchParams.get("limit")!);

  try {

    const count = await db.inventory.count();

    const results = await db.inventory.findMany({
        take: limit,
        skip: start * limit,
        orderBy: {
          id: "asc",
        },
    });
    return NextResponse.json({
      rows: results,
      pageCount: Math.ceil(count / limit),
      rowCount: count,
    });
  } catch (error) {
    return new NextResponse("An error occurred while fetching the inventory.", { status: 500 });
  }

}