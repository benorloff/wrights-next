import { Inventory, Prisma } from "@prisma/client";
import { InventoryWithSelect, db, getItemById } from "@/lib/db";
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  Users2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InventoryItemForm } from "@/components/inventory/inventory-item-form";

// async function getInventoryItem(id: string) {
//     const item = await db.inventory.findUnique({
//         where: {
//             id: parseInt(id),
//         },
//         select: {
//             id: true,
//             whse: true,
//             partNo: true,
//             description: true,
//         }
//     });
//     return item;
// }

// Inventory Item Component
const InventoryItemPage = async ({
    params,
}: {
    params: { id: string };
}) => {
    
    const item: InventoryWithSelect = await getItemById(params.id);

    return (
        <InventoryItemForm item={item as InventoryWithSelect} />
    )
}

export default InventoryItemPage;