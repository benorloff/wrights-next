"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Papa from "papaparse";

import { 
    CsvParseResults,
    CsvUploadResponse,
    CsvParseAnalysis,
    formatFileSize, 
    checkParseResults,
    splitStringToArray
} from "@/utils/csv"
import { UploadDropzone } from "@/utils/uploadthing"
import { Button } from "@/components/ui/button"
import { useAction } from "@/hooks/use-action";
import { udfBulkUpdate } from "@/actions/udf-bulk-update";
import { UdfBulkUpdateSchema } from "@/actions/udf-bulk-update/schema";
import { toast } from "sonner";
import { Udf } from "@prisma/client";

type Step = "upload" | "parse" | "review" | "complete";

export const CsvUpload = () => {

    const [file, setFile] = useState<CsvUploadResponse>();
    const [parseError, setParseError] = useState<string>();
    const [parseResults, setParseResults] = useState<CsvParseResults>();
    const [parseAnalysis, setParseAnalysis] = useState<CsvParseAnalysis>();
    const [step, setStep] = useState<Step>("upload");

    useEffect(() => {
        let rowCount = 0;
        console.log("File changed", file)
        if (!file) return;
        Papa.parse(file.url, {
            download: true,
            transform: function(value,field) {
                if (field === "features" || field === "imageUrls") {
                    return value.split(",").map((item) => item.trim());
                }
                return value;
            },
            step: function(results, parser) {
                rowCount++;
                if (!results.data.productId) {
                    parser.pause();
                    toast.error("Missing productId in row " + rowCount);
                    setParseError("Missing productId in row " + rowCount);
                }
                console.log("Row data: ", results.data);
            },
            dynamicTyping: true,
            header: true,
            fastMode: true,
            complete: (results, file) => {
                setParseResults({
                    data: results.data as {
                        productId: number,
                        features: string[],
                        imageUrls: string[],
                        [key: string]: string | string[] | number | boolean | null
                    }[],
                    errors: results.errors as {
                        type: string, 
                        code: string, 
                        message: string, 
                        row: number
                    }[],
                    meta: results.meta as {
                        aborted: boolean, 
                        cursor: number, 
                        delimiter: string, 
                        fields: string[], 
                        linebreak: string, 
                        truncated: boolean
                    },
                    file
                })
            }
        })
    }, [file]);

    useEffect(() => {

        if (!parseResults) return;
        console.log("Parse results changed", parseResults)
        console.log("Parse analysis: ", parseAnalysis)

        // 
        const data = checkParseResults(parseResults!)
        setParseAnalysis(data);
    
    }, [parseResults])

    useEffect(() => {
        console.log("Parse analysis changed", parseAnalysis)
    }, [parseAnalysis])

    const { execute, isLoading, error } = useAction(udfBulkUpdate, {
        onSuccess: (data) => {
            toast.success("Bulk update success")
            console.log("Bulk update success", data)
        },
        onError: (error) => {
            toast.error("Bulk update error")
            console.error("Bulk update error", error)
        }
    })

    const onConfirm = () => {

        console.log(parseAnalysis, "<-- parseAnalysis")
        console.log(parseResults, "<-- parseResults")

        // Prevent data from being sent if it's not valid
        if (parseAnalysis === undefined || !parseAnalysis.isValid || !parseResults?.data) return;

        console.log("client confirmed data, sending to server: ", parseResults.data, "<-- data");


        execute(parseResults.data)
        // udfBulkUpdate(parseResults.data)
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="w-full border rounded-lg p-4 space-y-4">
                <div className="text-xl">Upload</div>
                    { !file ? (
                        <UploadDropzone
                            endpoint="csvUploader"
                            onClientUploadComplete={(res): void => {
                                const { name, url, size, type } = res[0] as CsvUploadResponse;
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
                    { parseError && (
                            <div>
                                <div className="text-red-500">Error parsing file</div>
                                <p>{parseError}</p>
                            </div>
                    )}
            </div>
            <div className="w-full border rounded-lg p-4 space-y-4">
                    <div className="text-xl">File Details</div>
                    { parseResults && (
                        <div className="flex flex-col justify-between">
                            <div>
                                <h2>Parse Results</h2>
                                {/* <p>Fields: {parseResults.meta.fields.length}</p>
                                <p>Total rows: {parseResults.data.length}</p>
                                <p>Errors: {parseResults.errors.length}</p>
                                <p>Aborted: {parseResults.meta.aborted ? "true" : "false"}</p>
                                <p>Truncated: {parseResults.meta.truncated ? "true" : "false"}</p> */}
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
                <div className="text-xl">Review Changes</div>
                { parseAnalysis && (
                    <div>
                        <h2>Parse Analysis</h2>
                        <p>Valid: {parseAnalysis.isValid ? "Yes" : "No"}</p>
                        <p>Has productId: {parseAnalysis.meta.hasProductIdField ? "Yes" : "No"}</p>
                        <p>Has duplicate productId: {parseAnalysis.meta.hasDuplicateProductId ? "Yes" : "No"}</p>
                        <p>Invalid fields: {parseAnalysis.meta.invalidFields.length}</p>
                    </div>
                )}
            </div>
            <div className="w-full border rounded-lg p-4 space-y-4">
                <div className="text-xl">Confirmation</div>
                <Button
                    onClick={() => onConfirm()}
                    disabled={!parseAnalysis || !parseAnalysis.isValid || isLoading}
                >
                    Confirm
                </Button>
            </div>
        </div>
    )
}