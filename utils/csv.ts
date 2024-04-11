import { Prisma } from "@prisma/client"

export interface CsvParseResults {
    data: {
        productId: number,
        [key: string]: string | number | boolean | null
    }[],
    errors: {
        type: string, 
        code: string, 
        message: string, 
        row: number
    }[],
    meta: {
        aborted: boolean, 
        cursor: number, 
        delimiter: string, 
        fields: string[], 
        linebreak: string, 
        truncated: boolean
    },
    file: string,
}

export interface CsvUploadResponse {
    name: string,
    url: string,
    size: number,
    type: string
}

export interface CsvParseAnalysis {
    isValid: boolean,
    meta: {
        hasProductId: boolean,
        hasDuplicateProductId: boolean,
        invalidFields: string[]
    }
}

export interface CsvApprovedData {
    data: {
        productId: number,
        [key: string]: string | number | boolean | null
    }[],

}

export const formatFileSize = (bytes: number, decimals: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024, 
        dm = decimals || 2,
        sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export const checkParseResults = (parseResults: CsvParseResults) => {
    
    let isFileValid: boolean = false;
    let hasProductId: boolean = false;
    let hasDuplicateProductId: boolean = false;
    let invalidFields: string[] = [];
    
    const fields = parseResults?.meta.fields;
    
    // Check if the CSV has the required "productId" field
    hasProductId = fields?.includes("productId");

    // Check if there are duplicate productIds
    if (hasProductId) {
        const productIds = new Set();

        parseResults?.data.forEach((row) => {
            productIds.add(row.productId)
        })

        hasDuplicateProductId = productIds.size !== parseResults?.data.length;
    }
    
    // Prisma generated type enum for UDF model
    const validFields = Prisma.UdfScalarFieldEnum;

    // Check the parse result fields against the valid fields enum
    fields?.forEach((field) => !(field in validFields) && invalidFields.push(field));

    if (hasProductId && !hasDuplicateProductId && invalidFields.length === 0) {
        isFileValid = true;
    }

    return {
        isValid: isFileValid,
        meta: {
            hasProductId,
            hasDuplicateProductId,
            invalidFields,
        }
    }

}