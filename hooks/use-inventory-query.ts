import { db } from "@/lib/db"
import { Inventory } from "@prisma/client";
import { 
    useQuery,
    keepPreviousData,
} from "@tanstack/react-query";

interface InventoryQueryProps {
    pagination: {
        pageIndex: number,
        pageSize: number,
    }
}

export const useInventoryQuery = async ({
    pagination,
}: InventoryQueryProps) => {

    const { pageIndex, pageSize } = pagination;

    const getInventory = async (
        pageIndex: number,
        pageSize: number,
    ) => {
        const inventory = await db.inventory.findMany({
            orderBy: {
                id: "asc",
            },
            skip: pageIndex * pageSize,
            take: pageSize,
        });
        return inventory;
    };

    const data = useQuery({
        queryKey: ["data", pagination],
        queryFn: () => getInventory(pageIndex, pageSize),
        placeholderData: keepPreviousData,
    })

    return data;

}