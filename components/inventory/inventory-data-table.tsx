"use client"

import { useState, useMemo } from "react";

import {
    ColumnFiltersState,
    PaginationState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";


import { columns } from "@/components/inventory/columns"
import { useQuery, keepPreviousData } from "@tanstack/react-query"

export function InventoryDataTable() {

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); 
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    // const [pagination, setPagination] = useState<PaginationState>({
    //     pageIndex: 0,
    //     pageSize: 10,
    // })

    const inventoryColumns = useMemo(() => columns, [])

    // const countQuery = useQuery({
    //     queryKey: ['inventoryCount'],
    //     queryFn: () => fetch('/api/inventory/count').then((res) => res.json()),
    //     staleTime: 600 * 1000,
    // })

    const inventoryQuery = useQuery({
        // queryKey: ['inventory', pagination],
        // queryFn: () => fetch(`/api/inventory?start=${pagination.pageIndex}&limit=${pagination.pageSize}`)
        //     .then((res) => res.json()),
        queryKey: ['inventory'],
        queryFn: () => fetch(`/api/inventory`).then((res) => res.json()),
    })

    const defaultData = useMemo(() => [], [])

    const table = useReactTable({
        data: inventoryQuery.data ?? defaultData,
        columns: columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        // onPaginationChange: setPagination,
        // manualPagination: true,
        // rowCount: countQuery.data?.data,
        state: {
            // pagination,
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        }, 
    })

    return (
        <div className="space-y-4">
            <DataTableToolbar table={table} />
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </TableHead>
                        )
                        })}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                        Loading...
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
};
