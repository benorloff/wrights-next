import { z } from 'zod';
import { Prisma, Udf } from '@prisma/client';

import { ActionState } from '@/utils/create-safe-action';
import { InventoryItemSchema } from '@/components/inventory/inventory-item-form';

export type InputType = z.infer<typeof InventoryItemSchema>;
export type ReturnType = ActionState<InputType, Udf>;