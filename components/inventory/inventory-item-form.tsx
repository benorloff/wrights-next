"use client"

import { CollapsibleCard } from "@/components/collapsible-card";
import { getInventory } from "@/lib/spire";
import { Inventory, Prisma, PrismaClient } from "@prisma/client";
import { useForm, DefaultValues } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem,
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { db } from "@/lib/db";

// const inventoryItem = Prisma.validator<Prisma.InventoryDefaultArgs>()({})

// export type InventoryItem = Prisma.InventoryGetPayload<typeof inventoryItem>


// Temporary workaround to create a schema for the response object from Prisma model
// Unable to use Prisma generated model type due to nullable fields throwing type errors
// https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types
// const InventorySchema = z.object({
//     id: z.number(),
//     whse: z.string().max(6, { message: 'Must be 6 or less characters' }),
//     partNo: z.string().max(34, { message: 'Must be 34 or less characters' }),
//     description: z.string().optional() || z.undefined() || z.ZodReadonly,
//     status: z.number().nullish(),
//     availableQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     onHandQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     backorderQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     committedQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     onPurchaseQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     buyMeasureCode: z.string().optional() || z.undefined() || z.ZodReadonly,
//     stockMeasureCode: z.string().optional() || z.undefined() || z.ZodReadonly,
//     sellMeasureCode: z.string().optional() || z.undefined() || z.ZodReadonly,
//     alternatePartNo: z.string().optional() || z.undefined() || z.ZodReadonly,
//     currentCost: z.string().optional() || z.undefined() || z.ZodReadonly,
//     averageCost: z.string().optional() || z.undefined() || z.ZodReadonly,
//     standardCost: z.string().optional() || z.undefined() || z.ZodReadonly,
//     groupNo: z.string().optional() || z.undefined() || z.ZodReadonly,
//     type: z.string().optional() || z.undefined() || z.ZodReadonly,
//     salesDepartment: z.string().optional() || z.undefined() || z.ZodReadonly,
//     userDef1: z.string().optional() || z.undefined() || z.ZodReadonly,
//     userDef2: z.string().optional() || z.undefined() || z.ZodReadonly,
//     poDueDate: z.string().optional() || z.undefined() || z.ZodReadonly,
//     currentPONo: z.string().optional() || z.undefined() || z.ZodReadonly,
//     reorderPoint: z.string().optional() || z.undefined() || z.ZodReadonly,
//     minimumBuyQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     lastYearQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     lastYearSales: z.string().optional() || z.undefined() || z.ZodReadonly,
//     thisYearQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     thisYearSales: z.string().optional() || z.undefined() || z.ZodReadonly,
//     nextYearQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     nextYearSales: z.string().optional() || z.undefined() || z.ZodReadonly,
//     allowBackorders: z.boolean().nullish(),
//     allowReturns: z.boolean().nullish(),
//     dutyPct: z.string().optional() || z.undefined() || z.ZodReadonly,
//     freightPct: z.string().optional() || z.undefined() || z.ZodReadonly,
//     defaultExpiryDate: z.number().nullish(),
//     lotConsumeType: z.number().nullish(),
//     manufactureCountry: z.string().optional() || z.undefined() || z.ZodReadonly,
//     harmonizedCode: z.string().optional() || z.undefined() || z.ZodReadonly,
//     suggestedOrderQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     pricing: z.string().optional() || z.undefined() || z.ZodReadonly,
//     uom: z.string().optional() || z.undefined() || z.ZodReadonly,
//     packSize: z.string().optional() || z.undefined() || z.ZodReadonly,
//     foregroundColor: z.string(),
//     backgroundColor: z.string(),
//     levy: z.string().optional() || z.undefined() || z.ZodReadonly,
//     primaryVendor: z.string().optional() || z.undefined() || z.ZodReadonly,
//     allowBackOrders: z.boolean().nullish(),
//     dfltExpiryDays: z.number().nullish(),
//     mfgCountry: z.string().optional() || z.undefined() || z.ZodReadonly,
//     hsCode: z.string().optional() || z.undefined() || z.ZodReadonly,
//     serializedMode: z.string().optional() || z.undefined() || z.ZodReadonly,
//     upload: z.boolean().nullish(),
//     lastModified: z.string().optional() || z.undefined() || z.ZodReadonly,
//     lastSaleDate: z.string().optional() || z.undefined() || z.ZodReadonly,
//     lastReceiptDate: z.string().optional() || z.undefined() || z.ZodReadonly,
//     lastCountDate: z.string().optional() || z.undefined() || z.ZodReadonly,
//     lastCountQty: z.string().optional() || z.undefined() || z.ZodReadonly,
//     lastCountVariance: z.string().optional() || z.undefined() || z.ZodReadonly,
//     created: z.string().optional() || z.undefined() || z.ZodReadonly,
//     createdBy: z.string().optional() || z.undefined() || z.ZodReadonly,
//     modified: z.string().optional() || z.undefined() || z.ZodReadonly,
//     modifiedBy: z.string().optional() || z.undefined() || z.ZodReadonly,
//     links: z.string().optional() || z.undefined() || z.ZodReadonly,
// });

// export type FormType = z.infer<typeof InventorySchema>;

export const InventoryItemForm = ({
    item
}: {
    item: any;
}) => {

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const form = useForm({
        // resolver: zodResolver(InventoryItem),
        defaultValues: {
            ...item
        },
    });

    const onSubmit = (values: any) => {
        console.log(values, '<-- values from onSubmit')
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col h-full rounded-lg gap-4">
                        <div className="text-lg">Product ID: {item.id}</div>
                        <CollapsibleCard title="General">
                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="partNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Part Number</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field}
                                                    disabled={!isEditing}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="whse"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Warehouse</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field}
                                                    disabled={!isEditing}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    disabled={!isEditing}
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                </div>
                            </div>
                        </CollapsibleCard>
                        <CollapsibleCard title="Quantities">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="availableQty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Available</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        disabled={!isEditing}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="onHandQty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>On Hand</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        disabled={!isEditing}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="backorderQty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Backorder</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        disabled={!isEditing}
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="committedQty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Committed</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        disabled={!isEditing}
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CollapsibleCard>
                        <CollapsibleCard title="Section 3">
                            <div>{item.partNo}</div>
                        </CollapsibleCard>
                    </div>
                    <div className="flex flex-col h-full rounded-lg gap-4">
                        <div className="text-lg">Column 2</div>
                        <CollapsibleCard title="Section 1">
                            <div>Something</div>
                        </CollapsibleCard>
                        <CollapsibleCard title="Section 2">
                            <div>Something</div>
                        </CollapsibleCard>
                        <CollapsibleCard title="Section 3">
                            <div>Something</div>
                        </CollapsibleCard>
                    </div>
                    <div className="flex flex-col h-full rounded-lg gap-4">
                        <div className="text-lg">Column 3</div>
                        <CollapsibleCard title="Section 1">
                            <div>Something</div>
                        </CollapsibleCard>
                        <CollapsibleCard title="Section 2">
                            <div>Something</div>
                        </CollapsibleCard>
                        <CollapsibleCard title="Section 3">
                            <div>Something</div>
                        </CollapsibleCard>
                    </div>
                </div>
            </form>
        </Form>
    )
}