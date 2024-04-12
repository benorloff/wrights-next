"use server"

import { db } from "@/lib/db";
import { InputType, Results, ReturnType } from "./types"
import { createSafeAction } from "@/utils/create-safe-action";
import { Prisma, Udf } from "@prisma/client";
import { UdfBulkUpdateSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {

    console.log("udf bulk update handler hit: approvedData -->", data.length)

    const createUdf = (data: any) => {
        return Prisma.validator<Prisma.UdfUncheckedCreateInput>()({
            ...data
        })
    };

    const updateUdf = (data: any) => {
        return Prisma.validator<Prisma.UdfUncheckedUpdateInput>()({
            ...data
        })
    };

    const findSpecificUdf = (id: number) => {
        return Prisma.validator<Prisma.UdfWhereUniqueInput>()({
            productId: id,
        })
    };

    const promises: Promise<Udf>[] = [];


    data.forEach((row) => {
        promises.push(
            db.udf.upsert({
                where: findSpecificUdf(row.productId),
                create: createUdf(row),
                update: updateUdf(row),
            })
        )
    })
    
    const productIds = await Promise.all(promises).then((results) => {
        let productIds: number[] = []
        results.forEach((result) => {
            productIds.push(result.productId)
        })
        return productIds;
    })
    .then((productIds) => {
        console.log("productIds -->", productIds)
        return { data: { productIds }};
    })
    .catch((error) => {
        console.log("error -->", error)
        return {error: 'Bulk update failed'}
    })

    return productIds;

};

export const udfBulkUpdate = createSafeAction(UdfBulkUpdateSchema, handler);