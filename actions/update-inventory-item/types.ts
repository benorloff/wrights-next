import { z } from 'zod';
import { Udf } from '@prisma/client';

import { ActionState } from '@/utils/create-safe-action';
import { UpdateInventoryItemSchema } from './schema';

export type InputType = z.infer<typeof UpdateInventoryItemSchema>;
export type ReturnType = ActionState<InputType, Udf>;