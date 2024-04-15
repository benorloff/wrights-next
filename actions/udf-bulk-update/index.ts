"use server"

import { db } from "@/lib/db";
import { InputType, Results, ReturnType } from "./types"
import { createSafeAction } from "@/utils/create-safe-action";
import { Inventory, Prisma, Udf } from "@prisma/client";
import { UdfUpdateSchema, UdfBulkUpdateSchema, UdfFields } from "./schema";
import { z } from "zod";

const handler = async (data: InputType): Promise<ReturnType> => {

    const createNestedUdf = (row: any) => {
        return Prisma.validator<Prisma.UdfCreateNestedOneWithoutProductInput>()({
            ...row
        })
    };

    const updateNestedUdf = (row: any) => {
        return Prisma.validator<Prisma.UdfUpdateOneWithoutProductNestedInput>()({
            ...row
        })
    };

    const findSpecificProduct = ({
        whse,
        partNo,
    }: {
        whse: string,
        partNo: string
    }) => {
        return Prisma.validator<Prisma.InventoryWhereUniqueInput>()({
            whse_partNo: {
                whse,
                partNo,
            }
        })
    };

    const promises: Promise<Inventory>[] = [];


    data.forEach((row) => {
        const { whse, partNo, ...rest } = row;
        promises.push(
            db.inventory.update({
                where: findSpecificProduct({
                    whse, 
                    partNo,
                }),
                data: {
                    udf: {
                        upsert: {
                            create: createNestedUdf({
                                ...rest
                            }),
                            update: updateNestedUdf({
                                ...rest
                            }),
                        },
                    },
                },
                include: {
                    udf: {
                        select: {
                            id: true,
                        }
                    } 
                },
            })
        )
    })
    
    const productIds = await Promise.all(promises)
    .then((results) => {
        let productIds: number[] = []
        results.forEach((result) => {
            productIds.push(result.id)
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