import { ActionState } from '@/utils/create-safe-action';
import { UdfBulkUpdateSchema } from './schema';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export interface Results {
    productIds: number[];
};

export type InputType = z.infer<typeof UdfBulkUpdateSchema>;
export type ReturnType = ActionState<InputType, Results>;