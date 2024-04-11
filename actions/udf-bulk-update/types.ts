import { ActionState } from '@/utils/create-safe-action';
import { UdfBulkUpdateSchema } from './schema';
import { z } from 'zod';

export type InputType = z.infer<typeof UdfBulkUpdateSchema>;
export type ReturnType = ActionState<InputType, { 
    count: number, 
    errors: {
        id: number, 
        error: any
    }[]
}>;