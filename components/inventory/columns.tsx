"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Inventory } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableRowActions } from "../data-table/data-table-row-actions";

export const columns: ColumnDef<Inventory>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => (
            <DataTableColumnHeader title="ID" column={column} /> 
        ),
        cell: info => info.getValue()?.toString() || "", 
    },
    {
        accessorKey: "whse",
        header: ({ column }) => (
            <DataTableColumnHeader title="Warehouse" column={column} /> 
        ),
    },
    {
        accessorKey: "partNo",
        header: ({ column }) => (
            <DataTableColumnHeader title="Part #" column={column} /> 
        ),
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader title="Description" column={column} /> 
        ),
    },
    //   {
    //     accessorKey: "status",
    //     header: "Status",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "availableQty",
    //     header: "Available Quantity",
    //   },
    //   {
    //     accessorKey: "onHandQty",
    //     header: "On Hand Quantity",
    //   },
    //   {
    //     accessorKey: "backorderQty",
    //     header: "Backorder Quantity",
    //   },
    //   {
    //     accessorKey: "committedQty",
    //     header: "Committed Quantity",
    //   },
    //   {
    //     accessorKey: "onPurchaseQty",
    //     header: "On Purchase Quantity",
    //   },
    //   {
    //     accessorKey: "buyMeasureCode",
    //     header: "Buy Measure Code",
    //   },
    //   {
    //     accessorKey: "stockMeasureCode",
    //     header: "Stock Measure Code",
    //   },
    //   {
    //     accessorKey: "sellMeasureCode",
    //     header: "Sell Measure Code",
    //   },
    //   {
    //     accessorKey: "alternatePartNo",
    //     header: "Alternate Part Number",
    //   },
    //   {
    //     accessorKey: "currentCost",
    //     header: "Current Cost",
    //   },
    //   {
    //     accessorKey: "averageCost",
    //     header: "Average Cost",
    //   },
    //   {
    //     accessorKey: "standardCost",
    //     header: "Standard Cost",
    //   },
    //   {
    //     accessorKey: "groupNo",
    //     header: "Group Number",
    //   },
    //   {
    //     accessorKey: "type",
    //     header: "Type",
    //   },
    //   {
    //     accessorKey: "salesDepartment",
    //     header: "Sales Department",
    //   },
    //   {
    //     accessorKey: "userDef1",
    //     header: "User Defined 1",
    //   },
    //   {
    //     accessorKey: "userDef2",
    //     header: "User Defined 2",
    //   },
    //   {
    //     accessorKey: "poDueDate",
    //     header: "PO Due Date",
    //   },
    //   {
    //     accessorKey: "currentPONo",
    //     header: "Current PO Number",
    //   },
    //   {
    //     accessorKey: "reorderPoint",
    //     header: "Reorder Point",
    //   },
    //   {
    //     accessorKey: "minimumBuyQty",
    //     header: "Minimum Buy Quantity",
    //   },
    //   {
    //     accessorKey: "lastYearQty",
    //     header: "Last Year Quantity",
    //   },
    //   {
    //     accessorKey: "lastYearSales",
    //     header: "Last Year Sales",
    //   },
    //   {
    //     accessorKey: "thisYearQty",
    //     header: "This Year Quantity",
    //   },
    //   {
    //     accessorKey: "thisYearSales",
    //     header: "This Year Sales",
    //   },
    //   {
    //     accessorKey: "nextYearQty",
    //     header: "Next Year Quantity",
    //   },
    //   {
    //     accessorKey: "nextYearSales",
    //     header: "Next Year Sales",
    //   },
    //   {
    //     accessorKey: "allowBackorders",
    //     header: "Allow Backorders",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "allowReturns",
    //     header: "Allow Returns",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "dutyPct",
    //     header: "Duty Percentage",
    //   },
    //   {
    //     accessorKey: "freightPct",
    //     header: "Freight Percentage",
    //   },
    //   {
    //     accessorKey: "defaultExpiryDate",
    //     header: "Default Expiry Date",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "lotConsumeType",
    //     header: "Lot Consume Type",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "manufactureCountry",
    //     header: "Manufacture Country",
    //   },
    //   {
    //     accessorKey: "harmonizedCode",
    //     header: "Harmonized Code",
    //   },
    //   {
    //     accessorKey: "suggestedOrderQty",
    //     header: "Suggested Order Quantity",
    //   },
    //   {
    //     accessorKey: "pricing",
    //     header: "Pricing",
    //   },
    //   {
    //     accessorKey: "uom",
    //     header: "Unit of Measure",
    //   },
    //   {
    //     accessorKey: "packSize",
    //     header: "Pack Size",
    //   },
    //   {
    //     accessorKey: "foregroundColor",
    //     header: "Foreground Color",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "backgroundColor",
    //     header: "Background Color",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "levy",
    //     header: "Levy",
    //   },
    //   {
    //     accessorKey: "primaryVendor",
    //     header: "Primary Vendor",
    //   },
    //   {
    //     accessorKey: "allowBackOrders",
    //     header: "Allow Back Orders",
    //     cell: info => info.getValue(),
    //   },
    //   {
    //     accessorKey: "dfltExpiryDays",
    //     header: "Default Expiry Days",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "mfgCountry",
    //     header: "Manufacturing Country",
    //   },
    //   {
    //     accessorKey: "hsCode",
    //     header: "HS Code",
    //   },
    //   {
    //     accessorKey: "serializedMode",
    //     header: "Serialized Mode",
    //   },
    //   {
    //     accessorKey: "upload",
    //     header: "Upload",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "lastModified",
    //     header: "Last Modified",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "lastSaleDate",
    //     header: "Last Sale Date",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "lastReceiptDate",
    //     header: "Last Receipt Date",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "lastCountDate",
    //     header: "Last Count Date",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "lastCountQty",
    //     header: "Last Count Quantity",
    //   },
    //   {
    //     accessorKey: "lastCountVariance",
    //     header: "Last Count Variance",
    //   },
    //   {
    //     accessorKey: "created",
    //     header: "Created",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
      // {
      //   accessorKey: "createdBy",
      //   header: ({ column }) => (
      //       <DataTableColumnHeader title="Created By" column={column} /> 
      //   ),
      //   cell: ({ row }) => row.getValue("createdBy"), 
      //   filterFn: (row, id, value) => {
      //     return value.includes(row.getValue(id))
      //   },
      // },
      {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
      },
    //   {
    //     accessorKey: "modified",
    //     header: "Modified",
    //     cell: info => info.getValue()?.toString() || "",
    //   },
    //   {
    //     accessorKey: "modifiedBy",
    //     header: "Modified By",
    //   },
    //   {
    //     accessorKey: "links",
    //     header: "Links",
    //   },
];
