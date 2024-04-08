import { CollapsibleCard } from "@/components/collapsible-card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

const InventoryItemPage = ({
    params,
}: {
    params: { id: string };
}) => {

    return (
        <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col h-full rounded-lg gap-4">
                <div className="text-lg">Column 1</div>
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
    )
}

export default InventoryItemPage;