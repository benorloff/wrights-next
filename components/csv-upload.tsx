"use client"

import { UploadButton, UploadDropzone } from "@/utils/uploadthing"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import Papa from "papaparse";
import { ClientUploadedFileData } from "uploadthing/types"
import { formatFileSize } from "@/utils/format-file-size"
import Link from "next/link"
import { Prisma } from "@prisma/client"

interface ParseResults {
    data: {
        [key: string]: [value: string | number | boolean | null]
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

interface FileUploadResponse {
    name: string,
    url: string,
    size: number,
    type: string
}

interface ParseAnalysis {
    valid: boolean,
    meta: {
        hasProductId: boolean,
        hasDuplicateProductId: boolean,
        invalidFields: string[]
    }
}

type Step = "upload" | "parse" | "review" | "complete";

function checkParseResults(parseResults: ParseResults) {
    
    let isFileValid: boolean = false;
    let hasProductId: boolean = false;
    let hasDuplicateProductId: boolean = false;
    let invalidFields: string[] = [];
    
    const fields = parseResults?.meta.fields;
    
    // Check if the CSV has a "productId" field
    hasProductId = fields?.includes("productId");

    // Check if there are duplicate productIds
    if (hasProductId) {
        const productIds = new Set();

        parseResults?.data.forEach((row) => {
            productIds.add(row.productId)
        })

        hasDuplicateProductId = productIds.size !== parseResults?.data.length;
    }
    
    // Prisma generate type enum for UDF model
    const validFields = Prisma.UdfScalarFieldEnum;
    // console.log("Valid fields", validFields)

    // Check the parse result fields against the valid fields enum
    fields?.forEach((field) => !(field in validFields) && invalidFields.push(field));

    // console.log("Has productId", hasProductId, "Has duplicate productId", hasDuplicateProductId, "Invalid fields", invalidFields);

    if (hasProductId && !hasDuplicateProductId && invalidFields.length === 0) {
        isFileValid = true;
    }

    return {
        valid: isFileValid,
        meta: {
            hasProductId,
            hasDuplicateProductId,
            invalidFields,
        }
    }

}

export const CsvUpload = () => {

    const [file, setFile] = useState<FileUploadResponse>();
    const [parseResults, setParseResults] = useState<ParseResults>();
    const [parseAnalysis, setParseAnalysis] = useState<ParseAnalysis>();
    const [step, setStep] = useState<Step>("upload");

    useEffect(() => {
        // console.log("File changed", file)
        if (!file) return;
        Papa.parse(file.url, {
            download: true,
            dynamicTyping: true,
            header: true,
            complete: (results, file) => {
                setParseResults({
                    data: results.data as {[key: string]: [value: string]}[],
                    errors: results.errors as {type: string, code: string, message: string, row: number}[],
                    meta: results.meta as {aborted: boolean, cursor: number, delimiter: string, fields: string[], linebreak: string, truncated: boolean},
                    file
                })
            }
        })
    }, [file]);

    useEffect(() => {

        if (!parseResults) return;
        // console.log("Parse results changed", parseResults)
        const data = checkParseResults(parseResults!)
        setParseAnalysis(data);
    
    }, [parseResults])

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="w-full border rounded-lg p-4 space-y-4">
                <div className="text-xl">Upload</div>
                    { !file ? (
                        <UploadDropzone
                            endpoint="csvUploader"
                            onClientUploadComplete={(res): void => {
                                const { name, url, size, type } = res[0] as FileUploadResponse;
                                console.log("Client upload complete", res);
                                setFile({ name, url, size, type })
                            }}
                        />
                    ) : (
                        <div>
                            <p className="text-muted-foreground">File Uploaded Successfully</p>
                            <p>Name: {file.name}</p>
                            <p>Size: {formatFileSize(file.size, 2)}</p>
                            <p>Type: {file.type}</p>
                            <p>URL: <Link href={file.url} target="_blank" className="text-primary">{file.url}</Link></p>
                        </div>
                )}
            </div>
            <div className="w-full border rounded-lg p-4 space-y-4">
                    <div className="text-xl">File Details</div>
                    { parseResults && (
                        <div className="flex flex-col justify-between">
                            <div>
                                <h2>Parse Results</h2>
                                <p>Fields: {parseResults.meta.fields.length}</p>
                                <p>Total rows: {parseResults.data.length}</p>
                                <p>Errors: {parseResults.errors.length}</p>
                                <p>Aborted: {parseResults.meta.aborted ? "true" : "false"}</p>
                                <p>Truncated: {parseResults.meta.truncated ? "true" : "false"}</p>
                            </div>
                            <div className="flex flex-row justify-end items-center gap-4">
                                <Button
                                    variant="secondary"
                                >
                                    Discard
                                </Button>
                                <Button
                                    disabled={parseResults.errors.length > 0}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}
            </div>
            <div className="w-full border rounded-lg p-4 space-y-4">
                <div className="text-xl">Review</div>
                { parseAnalysis && (
                    <div>
                        <h2>Parse Analysis</h2>
                        <p>Valid: {parseAnalysis.valid ? "Yes" : "No"}</p>
                        <p>Has productId: {parseAnalysis.meta.hasProductId ? "Yes" : "No"}</p>
                        <p>Has duplicate productId: {parseAnalysis.meta.hasDuplicateProductId ? "Yes" : "No"}</p>
                        <p>Invalid fields: {parseAnalysis.meta.invalidFields.length}</p>
                    </div>
                )}
            </div>
            <div className="w-full border rounded-lg p-4 space-y-4">
                <div className="text-xl">Complete</div>
            </div>
        </div>
    )
}