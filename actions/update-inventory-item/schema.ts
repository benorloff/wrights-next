import { z } from 'zod';

export const UpdateInventoryItemSchema = z.object({
    product_id: z.number(),
    brand: z.string().max(34, { message: 'Brand must be 34 characters or less'}).optional(),
    features: z.coerce.string().array().optional(),
    dimensions: z.object({
        length: z.coerce.number(),
        width: z.coerce.number(),
        height: z.coerce.number(),
        unit: z.enum(['in', 'cm', 'mm']),
    }).partial(),
});