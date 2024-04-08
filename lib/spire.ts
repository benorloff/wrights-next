"use server"

import { Inventory, Prisma } from "@prisma/client";
import { db } from "./db";

export interface getInventoryProps {
    start: number;
    limit: number;
    sort?: keyof Prisma.InventoryFieldRefs;
    order?: "asc" | "desc";
    filter?: string;
    search?: string;
    fields?: keyof Prisma.InventoryFieldRefs[];
}

let offset: number = 0;
let batchSize: number = 5000;

export const getInventory = async ({
    start,
    limit,
    sort,
    order,
    filter,
    search,
    fields,
}: getInventoryProps) => {

    const API_URL = process.env.SPIRE_API_URL!;
    const API_USERNAME = process.env.SPIRE_API_USERNAME!;
    const API_PASSWORD = process.env.SPIRE_API_PASSWORD!;
    const COMPANY = process.env.SPIRE_API_COMPANY_NAME!;

    batchSize = limit;

    let url = `${API_URL}/companies/${COMPANY}/inventory/items/?start=${offset?.toString()}&limit=${batchSize?.toString()}`;
    
    let resources: Inventory[] = [];

    let count: number = 0;

    try {
        
        console.log(url, "<-- request URL")
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${btoa(`${API_USERNAME}:${API_PASSWORD}`)}`,
            },
        });

        const data = await res.json();
        
        count = data.count;

        const mapData = async () => {
            data.records.map((record: Inventory) => {
                const { 
                    id, 
                    salesDepartment,
                    pricing,
                    uom,
                    levy,
                    primaryVendor,
                    links,
                    ...rest 
                } = record;
                resources.push({
                    id,
                    salesDepartment: JSON.stringify(salesDepartment),
                    pricing: JSON.stringify(pricing),
                    uom: JSON.stringify(uom),
                    levy: JSON.stringify(levy),
                    primaryVendor: JSON.stringify(primaryVendor),
                    links: JSON.stringify(links),
                    ...rest
                });
            });
        };

        await mapData();

        await db.inventory.createMany({
            data: resources,
            skipDuplicates: true,
        });

        resources.length < batchSize ? (
            console.log(`All ${count} resources have been synced.`),
            resources = []
        ) : (
            console.log(`Synced ${resources.length} resources.`),
            resources = [],
            offset += batchSize,
            console.log(`Start updated to ${offset}.`),
            setTimeout(() => {
                console.log(`Syncing next batch of ${batchSize} resources...`);
                getInventory({ start: offset, limit: batchSize });
            }, 2000)
        );
    } catch (error) {
        console.error(error);
    }
};
