import { Prisma, PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
};

export const db = globalThis.prisma || new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
};

export async function getItemById(id: string) {
  const item = await db.inventory.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
          id: true,
          whse: true,
          partNo: true,
          description: true,
          udf: true,
      }, 
  });
  return item;
};

export type InventoryWithSelect = Prisma.PromiseReturnType<typeof getItemById>;

// Static warehouse data
// TODO: Move to database
export const warehouses = [
  {
    id: 1,
    code: "00",
    description: process.env.WAREHOUSE_1_NAME,
  },
  {
    id: 2,
    code: "01",
    description: process.env.WAREHOUSE_2_NAME,
  },
  {
    id: 3,
    code: "02",
    description: process.env.WAREHOUSE_3_NAME,
  },
  {
    id: 4,
    code: "03",
    description: process.env.WAREHOUSE_4_NAME,
  },
  {
    id: 5,
    code: "05",
    description: process.env.WAREHOUSE_5_NAME,
  },
  {
    id: 6,
    code: "",
    description: process.env.WAREHOUSE_6_NAME,
  },
  {
    id: 7,
    code: "07",
    description: process.env.WAREHOUSE_7_NAME,
  },
]