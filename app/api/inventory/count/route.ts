import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
) {
  try {
    const count = await db.inventory.count();
    console.log(count, '<-- count from route handler');
    return NextResponse.json({ data: count });
  } catch (error) {
    return new NextResponse("An error occurred while fetching the inventory count.", { status: 500 });
  }

}