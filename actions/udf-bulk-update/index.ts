"use server"

import { db } from "@/lib/db";
import { InputType, ReturnType } from "./types"
import { createSafeAction } from "@/utils/create-safe-action";
import { Prisma, Udf } from "@prisma/client";
import { UdfBulkUpdateSchema } from "./schema";

const handler = async (approvedData: InputType): Promise<ReturnType> => {

    let count: number = 0;
    let errors: { id: number, error: any }[] = [];

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
    }

    approvedData.forEach(async (row: Prisma.UdfUncheckedCreateInput) => {
        let udf: Udf;
        try {
            udf = await db.udf.upsert({
                where: findSpecificUdf(row.productId),
                update: updateUdf(row),
                create: createUdf(row),
            })
            count++;
        } catch (error) {
            errors.push({ id: row.productId, error })
            console.error(error)
        }
    })

    return { data: { count, errors } }
};

export const udfBulkUpdate = createSafeAction(UdfBulkUpdateSchema, handler);