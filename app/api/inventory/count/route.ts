import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  try {
    let data; 

    const { _count: { _all } } = await db.inventory.aggregate({
        _count: {
            _all: true,
        }
    });

    data = _all;
    console.log(data, '<-- data from route handler');

    return NextResponse.json({ data });
  } catch (error) {
    return new NextResponse("An error occurred while fetching the inventory count.", { status: 500 });
  }
}