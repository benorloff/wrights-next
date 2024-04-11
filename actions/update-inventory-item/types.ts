import { z } from 'zod';
import { Udf } from '@prisma/client';

import { ActionState } from '@/utils/create-safe-action';
import { UdfFormSchema } from '@/components/inventory/inventory-item-form';

export type InputType = z.infer<typeof UdfFormSchema>;
export type ReturnType = ActionState<InputType, Udf>;