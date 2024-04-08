import { cache } from 'react';
import { db } from "@/lib/db";

export const getInventoryCount = cache(async () => {
    let count: number = 0;
    try {
        const {_count: { _all }} = await db.inventory.aggregate({
            _count: {
                _all: true,
            }
        });
        count = _all;
    } catch (error) {
        console.error(error);
    }
    return count;
});