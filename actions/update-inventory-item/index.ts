"use server"

import { db } from "@/lib/db";
import { InputType, ReturnType } from "./types"
import { createSafeAction } from "@/utils/create-safe-action";
import { UpdateInventoryItemSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {

    const { productId, ...rest } = data;

    let udf;

    try {
        console.log(data, "<-- data from updateInventoryItem server action")

        udf = await db.udf.upsert({
            where: {
                productId,
            },
            update: {
                productId,
                ...rest,
            },
            create: {
                productId: productId as number,
                ...rest,
            }
        })
    } catch (error) {
        throw new Error(`Error updating inventory item: ${error}`);
    }

    // TODO: Add audit log

    return { data: udf };
};

export const updateInventoryItem = createSafeAction(UpdateInventoryItemSchema, handler);