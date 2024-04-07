"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "../ui/button"
import { getInventory } from "@/lib/spire"

export const GetInventoryButton = () => {
    return (
        <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
            onClick={() => getInventory({ start: 0, limit: 5000 })}
          >
            <RefreshCw className="size-3.5" />
            Sync
          </Button>
    )
}