import { InventoryWithInclude, getItemById } from "@/lib/db";

import { InventoryItemForm } from "@/components/inventory/inventory-item-form";

// Inventory Item Component
const InventoryItemPage = async ({
    params,
}: {
    params: { id: string };
}) => {
    
    const item = await getItemById(params.id);

    return (
        <InventoryItemForm item={item} />
    )
}

export default InventoryItemPage;