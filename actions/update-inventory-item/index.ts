"use server"

import { db } from "@/lib/db";
import { InputType, ReturnType } from "./types"
import { createSafeAction } from "@/utils/create-safe-action";
import { UpdateInventoryItemSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {

    let udf;

    try {
        console.log(data, "<-- data from updateInventoryItem server action")

        udf = await db.udf.upsert({
            where: {
                productId: data.product_id,
            },
            update: {
                brand: data.brand,
                features: data.features,
                length: data.dimensions?.length,
                width: data.dimensions?.width,
                height: data.dimensions?.height,
                unit: data.dimensions?.unit,
            },
            create: {
                productId: data.product_id,
                brand: data.brand,
                features: data.features,
                length: data.dimensions?.length,
                width: data.dimensions?.width,
                height: data.dimensions?.height,
                unit: data.dimensions?.unit,
            }
        })
    } catch (error) {
        throw new Error(`Error updating inventory item: ${error}`);
    }

    // TODO: Add audit log

    return { data: udf };
};

export const updateInventoryItem = createSafeAction(UpdateInventoryItemSchema, handler);