import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const data = await db.inventory.findUnique({
            where: {
                id: parseInt(id),
            },
        });
        return Response.json({ data })
    } catch (error) {
        return new Response("An error occurred while fetching the inventory item.", { status: 500 });
    }
}