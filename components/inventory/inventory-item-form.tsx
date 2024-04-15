"use client"

import { useState } from "react";

import Image from "next/image"
import Link from "next/link"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Inventory, Prisma } from "@prisma/client";
import { InventoryWithInclude, db, warehouses } from "@/lib/db";
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
    Form,
    FormField,
    FormLabel,
    FormMessage,
    FormControl,
    FormItem,
} from "@/components/ui/form"
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
import { useAction } from "@/hooks/use-action";
import { updateInventoryItem } from "@/actions/update-inventory-item";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UdfFields, UdfUpdateSchema } from "@/actions/udf-bulk-update/schema";
import { Checkbox } from "../ui/checkbox";

const unitEnum = z.enum(['in', 'cm', 'mm']);
const phaseEnum = z.enum(['1', '2', '3']);

export const UdfFormSchema = z.object({
    id: z.number(),
    whse: z.string(),
    partNo: z.string(),
    description: z.string(),
    brand: z.string().max(34, { message: 'Brand must be 34 characters or less'}).optional(),
    // TODO: Create db table to store features
    // Get all features from db on render and pass to field validation as enum
    // Render as "tag cloud" with chips and option to add new feature(s)
    features: z.coerce.string().array().optional(),
    // Zod .partial method makes all properties optional
    // https://zod.dev/?id=partial
    // images: z.object({
    //     featured: z.string().url().optional(),
    //     image1: z.string().url().optional(),
    //     image2: z.string().url().optional(),
    //     image3: z.string().url().optional(),
    //     image4: z.string().url().optional(),
    //     image5: z.string().url().optional(),
    // }).partial(),
    dimensions: z.object({
        length: z.coerce.number(),
        width: z.coerce.number(),
        height: z.coerce.number(),
        unit: z.coerce.string(),
    }).partial(),
    // docs: z.object({
    //     cadUrl: z.string().url(),
    //     catalogPageUrl: z.string().url(),
    //     dataSheetUrl: z.string().url(),
    //     userManualUrl: z.string().url(),
    // }).partial(),
    // specs: z.object({
    //     power: z.object({
    //         ratingHp: z.coerce.number(),
    //         ratingHp2: z.string(),
    //         ratingKw: z.coerce.number(),
    //         maxSpeed: z.coerce.number(),
    //         speed2: z.string(),
    //         voltage: z.string(),
    //         phase: phaseEnum,
    //         current: z.string(),
    //         current2: z.string(),
    //         downThrust: z.string(),
    //         duty: z.string(),
    //         efficiency: z.string(),
    //         electricalType: z.string(),
    //         startingType: z.string(),
    //     }).partial(),
    //     frame: z.object({
    //         prefix: z.string(),
    //         size: z.string(),
    //         suffix: z.string(),
    //         length: z.coerce.number(),
    //         lengthMm: z.coerce.number(),
    //         material: z.string(),
    //         type: z.string(),
    //     }).partial(),
    //     enclosureType: z.string(),
    //     // Question: Can rotation be enum?
    //     rotation: z.string(),
    //     mountingType: z.string(),
    //     maxAmbient: z.string(),
    //     boxMounting: z.string(),
    //     baseDiameter: z.string(),
    //     shaft: z.object({
    //         diameter: z.string(),
    //         diameterMm: z.coerce.number(),
    //         extension: z.string(),
    //         extensionMm: z.coerce.number(),
    //         type: z.string(),
    //     }).partial(),
    //     cDimMm: z.coerce.number(),
    //     cDimIn: z.coerce.number(),
    //     connectionDrawingNo: z.string(),
    //     deBearingSize: z.string(),
    //     deBearingType: z.string(),
    //     frequency: z.string(),
    //     hazardousLocation: z.string(),
    //     insulationClass: z.string(),
    //     ipCode: z.string(),
    //     kvaCode: z.string(),
    //     motorOrientation: z.string(),
    //     nemaDesign: z.string(),
    //     numPoles: z.string(),
    //     numSpeeds: z.string(),
    //     odeBearingSize: z.string(),
    //     odeBearingType: z.string(),
    //     outlineDrawingNo: z.string(),
    //     powerFactor: z.string(),
    //     resistanceMain: z.string(),
    //     serviceFactor: z.number(),
    //     thruBoltsExt: z.string(),
    //     overload: z.string(),
    // }).partial(),
    // certs: z.object({
    //     ce: z.boolean(),
    //     csa: z.boolean(),
    //     ul: z.boolean(),
    // }).partial(),
});

export const InventoryItemForm = ({
    item
}: {
    item: any;
}) => {

    const { udf } = item;

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const router = useRouter();

    const form = useForm<z.infer<typeof UdfFields>>({
        resolver: zodResolver(UdfFields),
        defaultValues: {
            brand: item.udf?.brand || "",
            features: item.udf?.features || [],
            length: item.udf?.length || 0, 
            width: item.udf?.width || 0, 
            height: item.udf?.height || 0, 
            unit: item.udf?.unit || "in",
            featuredImageUrl: item.udf?.featuredImageUrl || "",
            imageUrls: item.udf?.imageUrls || [],
            cadUrl: item.udf?.cadUrl || "",
            catalogPageUrl: item.udf?.catalogPageUrl || "",
            dataSheetUrl: item.udf?.dataSheetUrl || "",
            userManualUrl: item.udf?.userManualUrl || "",
            ratingHp: item.udf?.ratingHp || 0,
            ratingHp2: item.udf?.ratingHp2 || "",
            ratingKw: item.udf?.ratingKw || 0,
            maxSpeed: item.udf?.maxSpeed || 0,
            speed2: item.udf?.speed2 || "",
            voltage: item.udf?.voltage || "",
            phase: item.udf?.phase || "",
            current: item.udf?.current || "",
            current2: item.udf?.current2 || "",
            downThrust: item.udf?.downThrust || "", 
            duty: item.udf?.duty || "", 
            efficiency: item.udf?.efficiency || "",
            electricalType: item.udf?.electricalType || "",
            startingType: item.udf?.startingType || "",
            framePrefix: item.udf?.framePrefix || "",
            frameSize: item.udf?.frameSize || "",
            frameSuffix: item.udf?.frameSuffix || "",
            frameLength: item.udf?.frameLength || 0,
            frameLengthMm: item.udf?.frameLengthMm || 0,
            frameMaterial: item.udf?.frameMaterial || "",
            frameType: item.udf?.frameType || "",
            enclosureType: item.udf?.enclosureType || "",
            rotation: item.udf?.rotation || "",
            mountingType: item.udf?.mountingType || "",
            maxAmbient: item.udf?.maxAmbient || "",
            boxMounting: item.udf?.boxMounting || "",
            baseDiameter: item.udf?.baseDiameter || "",
            shaftDiameter: item.udf?.shaftDiameter || "",
            shaftDiameterMm: item.udf?.shaftDiameterMm || 0,
            shaftExtension: item.udf?.shaftExtension || "",
            shaftExtensionMm: item.udf?.shaftExtensionMm || 0,
            shaftType: item.udf?.shaftType || "",
            cDimMm: item.udf?.cDimMm || 0,
            cDimIn: item.udf?.cDimIn || 0,
            connectionDrawingNo: item.udf?.connectionDrawingNo || "",
            deBearingSize: item.udf?.deBearingSize || "",
            deBearingType: item.udf?.deBearingType || "",
            frequency: item.udf?.frequency || "",
            hazardousLocation: item.udf?.hazardousLocation || "",
            insulationClass: item.udf?.insulationClass || "",
            ipCode: item.udf?.ipCode || "",
            kvaCode: item.udf?.kvaCode || "",
            motorOrientation: item.udf?.motorOrientation || "",
            nemaDesign: item.udf?.nemaDesign || "",
            numPoles: item.udf?.numPoles || "",
            numSpeeds: item.udf?.numSpeeds || "",
            odeBearingSize: item.udf?.odeBearingSize || "",
            odeBearingType: item.udf?.odeBearingType || "",
            outlineDrawingNo: item.udf?.outlineDrawingNo || "",
            powerFactor: item.udf?.powerFactor || "",
            resistanceMain: item.udf?.resistanceMain || "",
            serviceFactor: item.udf?.serviceFactor || 0,
            thruBoltsExt: item.udf?.thruBoltsExt || "",
            overload: item.udf?.overload || "",
            certCe: item.udf?.certCe || false,
            certCsa: item.udf?.certCsa || false,
            certUl: item.udf?.certUl || false,
        },
    });

    const { execute, isLoading } = useAction(updateInventoryItem, {
        onSuccess: () => {
            toast.success('UDF fields updated successfully');
            router.refresh();
        },
        onError: (error) => {
            toast.error(error);
        }
    })

    const onSubmit = (values: z.infer<typeof UdfFields>) => {
        console.log("submit button clicked")
        // const { id, ...rest } = values;
        execute({...values});
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4 p-4">
                    <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-7 w-7">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        {`${item?.partNo} - ${item?.description}`}
                    </h1>
                    <Badge variant="outline" className="ml-auto sm:ml-0">
                        In stock
                    </Badge>
                    <div className="hidden items-center gap-2 md:ml-auto md:flex">
                        <Button variant="outline" size="sm">
                        Discard
                        </Button>
                        <Button size="sm" onClick={form.handleSubmit(onSubmit)}>
                            Save Product
                        </Button>
                    </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>General</CardTitle>
                                <CardDescription>
                                Lipsum dolor sit amet, consectetur adipiscing elit
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <FormLabel>Part #</FormLabel>
                                    <Input disabled placeholder={item?.partNo} />
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Warehouse</FormLabel>
                                    <Input disabled placeholder={item?.whse} />
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Description</FormLabel>
                                    <Input disabled placeholder={item?.description!} />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="features"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Features</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <div className="space-y-2">
                                        <FormLabel>Extended Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                disabled
                                                rows={5}
                                            />
                                        </FormControl>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Power</CardTitle>
                                <CardDescription>
                                    Lipsum dolor sit amet, consectetur adipiscing elit
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="ratingHp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating HP</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ratingHp2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating HP2</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ratingKw"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating KW</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxSpeed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Speed</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="speed2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Speed 2</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="voltage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Voltage</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phase"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phase</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="current"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="current2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current 2</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="downThrust"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Down Thrust</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duty</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="efficiency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Efficiency</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="electricalType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Electrical Type</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startingType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Starting Type</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        {/* <Card>
                            <CardHeader>
                                <CardTitle>Stock</CardTitle>
                                <CardDescription>
                                Lipsum dolor sit amet, consectetur adipiscing elit
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead className="w-[100px]">SKU</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="w-[100px]">Size</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                    <TableCell className="font-semibold">
                                        GGPC-001
                                    </TableCell>
                                    <TableCell>
                                        <Label htmlFor="stock-1" className="sr-only">
                                        Stock
                                        </Label>
                                        <Input
                                        id="stock-1"
                                        type="number"
                                        defaultValue="100"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Label htmlFor="price-1" className="sr-only">
                                        Price
                                        </Label>
                                        <Input
                                        id="price-1"
                                        type="number"
                                        defaultValue="99.99"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <ToggleGroup
                                        type="single"
                                        defaultValue="s"
                                        variant="outline"
                                        >
                                        <ToggleGroupItem value="s">S</ToggleGroupItem>
                                        <ToggleGroupItem value="m">M</ToggleGroupItem>
                                        <ToggleGroupItem value="l">L</ToggleGroupItem>
                                        </ToggleGroup>
                                    </TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell className="font-semibold">
                                        GGPC-002
                                    </TableCell>
                                    <TableCell>
                                        <Label htmlFor="stock-2" className="sr-only">
                                        Stock
                                        </Label>
                                        <Input
                                        id="stock-2"
                                        type="number"
                                        defaultValue="143"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Label htmlFor="price-2" className="sr-only">
                                        Price
                                        </Label>
                                        <Input
                                        id="price-2"
                                        type="number"
                                        defaultValue="99.99"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <ToggleGroup
                                        type="single"
                                        defaultValue="m"
                                        variant="outline"
                                        >
                                        <ToggleGroupItem value="s">S</ToggleGroupItem>
                                        <ToggleGroupItem value="m">M</ToggleGroupItem>
                                        <ToggleGroupItem value="l">L</ToggleGroupItem>
                                        </ToggleGroup>
                                    </TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell className="font-semibold">
                                        GGPC-003
                                    </TableCell>
                                    <TableCell>
                                        <Label htmlFor="stock-3" className="sr-only">
                                        Stock
                                        </Label>
                                        <Input
                                        id="stock-3"
                                        type="number"
                                        defaultValue="32"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Label htmlFor="price-3" className="sr-only">
                                        Stock
                                        </Label>
                                        <Input
                                        id="price-3"
                                        type="number"
                                        defaultValue="99.99"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <ToggleGroup
                                        type="single"
                                        defaultValue="s"
                                        variant="outline"
                                        >
                                        <ToggleGroupItem value="s">S</ToggleGroupItem>
                                        <ToggleGroupItem value="m">M</ToggleGroupItem>
                                        <ToggleGroupItem value="l">L</ToggleGroupItem>
                                        </ToggleGroup>
                                    </TableCell>
                                    </TableRow>
                                </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="justify-center border-t p-4">
                                <Button size="sm" variant="ghost" className="gap-1">
                                <PlusCircle className="h-3.5 w-3.5" />
                                Add Variant
                                </Button>
                            </CardFooter>
                        </Card> */}
                        {/* <Card x-chunk="dashboard-07-chunk-2">
                        <CardHeader>
                            <CardTitle>Product Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 sm:grid-cols-3">
                                <div className="grid gap-3">
                                    <Label htmlFor="category">Category</Label>
                                    <Select>
                                    <SelectTrigger
                                        id="category"
                                        aria-label="Select category"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="clothing">Clothing</SelectItem>
                                        <SelectItem value="electronics">
                                        Electronics
                                        </SelectItem>
                                        <SelectItem value="accessories">
                                        Accessories
                                        </SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="subcategory">
                                    Subcategory (optional)
                                    </Label>
                                    <Select>
                                    <SelectTrigger
                                        id="subcategory"
                                        aria-label="Select subcategory"
                                    >
                                        <SelectValue placeholder="Select subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="t-shirts">T-Shirts</SelectItem>
                                        <SelectItem value="hoodies">Hoodies</SelectItem>
                                        <SelectItem value="sweatshirts">
                                        Sweatshirts
                                        </SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        </Card> */}
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dimensions</CardTitle>
                                <CardDescription>
                                Lipsum dolor sit amet, consectetur adipiscing elit.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="length"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Length</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="width"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Width</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {["in","cm","mm"].map((unit) => (
                                                        <SelectItem 
                                                            key={unit} 
                                                            value={unit}
                                                        >
                                                            {unit}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    <Card
                    className="overflow-hidden"
                    >
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                            <CardDescription>
                            Lipsum dolor sit amet, consectetur adipiscing elit
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                            <Image
                                alt="Product image"
                                className="aspect-square w-full rounded-md object-cover"
                                height="300"
                                src="/placeholder.svg"
                                width="300"
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <button>
                                <Image
                                    alt="Product image"
                                    className="aspect-square w-full rounded-md object-cover"
                                    height="84"
                                    src="/placeholder.svg"
                                    width="84"
                                />
                                </button>
                                <button>
                                <Image
                                    alt="Product image"
                                    className="aspect-square w-full rounded-md object-cover"
                                    height="84"
                                    src="/placeholder.svg"
                                    width="84"
                                />
                                </button>
                                <button>
                                <Image
                                    alt="Product image"
                                    className="aspect-square w-full rounded-md object-cover"
                                    height="84"
                                    src="/placeholder.svg"
                                    width="84"
                                />
                                </button>
                                <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                                <Upload className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Upload</span>
                                </button>
                            </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="cadUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CAD URL</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="catalogPageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Catalog Page URL</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="dataSheetUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Data Sheet URL</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="userManualUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>User Manual URL</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="certCe"
                                        render={({ field }) => (
                                            <FormItem
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox 
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>CE</FormLabel>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="certCsa"
                                        render={({ field }) => (
                                            <FormItem
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox 
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>CSA</FormLabel>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="certUl"
                                        render={({ field }) => (
                                            <FormItem
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox 
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>UL</FormLabel>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:hidden">
                    <Button variant="outline" size="sm">
                        Discard
                    </Button>
                    <Button size="sm" type="submit">Save Product</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}