import { CollapsibleCard } from "@/components/collapsible-card";
import { getInventory } from "@/lib/spire";
import { Inventory, Prisma } from "@prisma/client";
import { useForm } from "react-hook-form";
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
import { InventoryItemForm } from "@/components/inventory/inventory-item-form";
import { db } from "@/lib/db";


// async function getInventoryItem(id: string) {
//     const res = await fetch(`http://localhost:3000/api/inventory/${id}`);
//     const { data } = await res.json();
//     return data;
// }

async function getInventoryItem(id: string) {
    const item = await db.inventory.findUnique({
        where: {
            id: parseInt(id),
        }
    });
    return { ...item } as Inventory;
}

// Inventory Item Component
const InventoryItemPage = async ({
    params,
}: {
    params: { id: string };
}) => {
    
    const item: Inventory = await getInventoryItem(params.id);

    return (
        <InventoryItemForm item={item} />
    )
}

export default InventoryItemPage;