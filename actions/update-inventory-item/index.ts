"use server"

import { db } from "@/lib/db";
import { InputType, ReturnType } from "./types"
import { createSafeAction } from "@/utils/create-safe-action";
import { UpdateInventoryItemSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {

    let item;

    try {
        item = await db.udf.upsert({
            where: {
                // Use the product ID to find the UDF record
                productId: data.id,
            },
            // If the UDF record exists, update it
            update: {
                ...data,
            },
            // If the UDF record does NOT exist, create it
            create: {
                productId: data.id,
                ...data,
            }
        })
    } catch (error) {
        throw new Error(`Error updating inventory item: ${error}`);
    }

    return { data: item };
};

export const updateInventoryItem = createSafeAction(UpdateInventoryItemSchema, handler);