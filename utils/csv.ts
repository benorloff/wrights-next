import { Prisma } from "@prisma/client"

export interface CsvParseResults {
    data: {
        whse: string,
        partNo: string,
        features: string[],
        imageUrls: string[],
        [key: string]: string | string[] | number | boolean | null
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
        hasWhseField: boolean,
        hasPartNoField: boolean,
        invalidFields: string[]
    }
}

export interface CsvApprovedData {
    data: {
        whse: string,
        partNo: string,
        features: string[],
        imageUrls: string[],
        [key: string]: string | string[] | number | boolean | null
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

export const splitStringToArray = (str: string, delimiter: string): string[] => {
    return str.split(delimiter).map((item) => item.trim());
}

export const checkParseResults = (parseResults: CsvParseResults) => {

    console.log("Checking parse results: ", parseResults, "<-- parseResults")
    
    let isFileValid: boolean = false;
    let hasWhseField: boolean = false;
    let hasPartNoField: boolean = false;
    let hasDuplicateProductId: boolean = false;
    let invalidFields: string[] = [];
    
    const fields = parseResults?.meta.fields;
    
    // Check if the CSV has the required "productId" field
    hasPartNoField = fields?.includes("partNo");
    hasWhseField = fields?.includes("whse");
    
    // Prisma generated type enum for UDF model
    const udfFields = Prisma.UdfScalarFieldEnum;
    // Whse and partNo are required to establish the relationship in the database
    const whsePartNo = { whse: "whse", partNo: "partNo" };
    const validFields = { ...whsePartNo, ...udfFields };

    // Check the parse result fields against the valid fields enum
    fields?.forEach((field) => 
        !(field in validFields) && invalidFields.push(field));

    if (hasPartNoField && hasWhseField && invalidFields.length === 0) {
        isFileValid = true;
    }

    return {
        isValid: isFileValid,
        meta: {
            hasPartNoField,
            hasWhseField,
            invalidFields,
        }
    }

}