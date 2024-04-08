import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
) {
  // const { searchParams } = new URL(req.url);
  // const start = searchParams.get("start");
  // const limit = searchParams.get("limit");
  try {
    // const data = await db.inventory.findMany({
    //     orderBy: {
    //         id: "asc",
    //     },
    //     skip: parseInt(start!),
    //     take: parseInt(limit!),
    // });
    const data = await db.inventory.findMany(
      {
        orderBy: {
          id: "asc",
        },
        // Temporarily taking only 1000 records to avoid performance issues
        take: 1000,
      }, 
    );
    // console.log(data, '<-- data from route handler');
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse("An error occurred while fetching the inventory.", { status: 500 });
  }

}