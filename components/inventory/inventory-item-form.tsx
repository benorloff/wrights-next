"use client"

import { useState } from "react";

import Image from "next/image"
import Link from "next/link"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Inventory, Prisma } from "@prisma/client";
import { db, warehouses } from "@/lib/db";
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

const unitEnum = z.enum(['in', 'cm', 'mm']);
const phaseEnum = z.enum(['1', '2', '3']);

export const UdfFormSchema = z.object({
    product_id: z.number(),
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
        unit: z.enum(['in', 'cm', 'mm']),
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

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const router = useRouter();

    const form = useForm<z.infer<typeof UdfFormSchema>>({
        resolver: zodResolver(UdfFormSchema),
        defaultValues: {
            product_id: item?.id,
            brand: "",
            features: [],
            dimensions: { length: 0, width: 0, height: 0, unit: "in" },
        }
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

    const onSubmit = (values: z.infer<typeof UdfFormSchema>) => {
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
                            <CardContent className="grid grid-cols-2 gap-6">
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
                                    <Input disabled placeholder={item?.description} />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand</FormLabel>
                                            <FormControl>
                                                <Input disabled {...field} />
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
                                <div className="col-span-2">
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
                                    name="dimensions.length"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Length</FormLabel>
                                            <FormControl>
                                                <Input placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dimensions.width"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Width</FormLabel>
                                            <FormControl>
                                                <Input placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dimensions.height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height</FormLabel>
                                            <FormControl>
                                                <Input placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dimensions.unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <Select onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {unitEnum._def.values.map((unit) => (
                                                        <SelectItem key={unit} value={unit}>
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
                        {/* <Card>
                        <CardHeader>
                            <CardTitle>Product Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="status">Status</Label>
                                <Select>
                                <SelectTrigger id="status" aria-label="Select status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                            </div>
                        </CardContent>
                        </Card> */}
                        {/* <Card
                        className="overflow-hidden" x-chunk="dashboard-07-chunk-4"
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
                        </Card> */}
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