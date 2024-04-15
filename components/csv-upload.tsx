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
import { Separator } from "./ui/separator";
import { set } from "zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Check } from "lucide-react";

type Steps = 1 | 2 | 3 | 4;

export const CsvUpload = () => {

    const [file, setFile] = useState<CsvUploadResponse>();
    const [parseError, setParseError] = useState<string>();
    const [parseResults, setParseResults] = useState<CsvParseResults>();
    const [parseAnalysis, setParseAnalysis] = useState<CsvParseAnalysis>();
    const [data, setData] = useState<number[]>([]);
    const [step, setStep] = useState<Steps>(1);

    useEffect(() => {
        let rowCount = 0;
        console.log("File changed", file)
        if (!file) return;
        Papa.parse(file.url, {
            download: true,
            transform: function(value,field) {
                if (field === "features" || field === "imageUrls") {
                    return value.split("|").map((item) => item.trim());
                }
                console.log("Transformed value: ", value, field)
                return value;
            },
            // step: function(results, parser) {
            //     rowCount++;
            //     if (!results.data.partNo) {
            //         parser.pause();
            //         toast.error("Missing partNo in row " + rowCount);
            //         setParseError("Missing partNo in row " + rowCount);
            //     }
            //     console.log("Row data: ", results.data);
            //     if (!results.data.whse) {
            //         parser.pause();
            //         toast.error("Missing whse in row " + rowCount);
            //         setParseError("Missing whse in row " + rowCount);
            //     }
            // },
            header: true,
            fastMode: true,
            complete: (results, file) => {
                setParseResults({
                    data: results.data as {
                        whse: string,
                        partNo: string,
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
                });
                setStep(2);
            }
        })
    }, [file]);

    useEffect(() => {

        if (!parseResults) return;
        console.log("Parse results changed", parseResults)
        console.log("Parse analysis: ", parseAnalysis)

        const data = checkParseResults(parseResults!)
        setParseAnalysis(data);
    
    }, [parseResults])

    useEffect(() => {
        console.log("Parse analysis changed", parseAnalysis)
    }, [parseAnalysis])

    const { execute, isLoading, error } = useAction(udfBulkUpdate, {
        onSuccess: (data) => {
            toast.success("Bulk update success")
            setData(data.productIds)
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
        <>
            {!file && (
                <>
                    <div className="text-xl">Upload</div>
                    <UploadDropzone
                        endpoint="csvUploader"
                        onClientUploadComplete={(res): void => {
                            const { name, url, size, type } = res[0] as CsvUploadResponse;
                            console.log("Client upload complete", res);
                            setFile({ name, url, size, type })
                        }}
                        className="border border-dashed border-muted rounded-lg p-4"
                    />
                    { parseError && (
                        <div>
                            <div className="text-red-500">Error parsing file</div>
                            <p>{parseError}</p>
                        </div>
                    )}
                </>
            )}
            { (file && parseError) && (
                <div>
                    <div className="text-red-500">Error parsing file</div>
                    <p>{parseError}</p>
                </div>
            )}
            {(file && !data.length) && (
                <>
                    <div className="text-xl">Review</div>
                    <div className="w-full border rounded-lg p-4 space-y-4">
                        { (parseResults && parseAnalysis) && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Parameter</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>File Name</TableCell>
                                        <TableCell>{file.name}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>File Size</TableCell>
                                        <TableCell>{formatFileSize(file.size, 2)}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>File Type</TableCell>
                                        <TableCell>{file.type}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>File URL</TableCell>
                                        <TableCell><Link href={file.url} target="_blank" className="text-primary">{file.url}</Link></TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Fields</TableCell>
                                        <TableCell>{parseResults.meta.fields.length}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total Rows</TableCell>
                                        <TableCell>{parseResults.data.length}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Errors</TableCell>
                                        <TableCell>{parseResults.errors.length}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Aborted</TableCell>
                                        <TableCell>{parseResults.meta.aborted.toString()}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Truncated</TableCell>
                                        <TableCell>{parseResults.meta.truncated.toString()}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Valid File</TableCell>
                                        <TableCell>{parseAnalysis.isValid.toString()}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Has Warehouse Field</TableCell>
                                        <TableCell>{parseAnalysis.meta.hasWhseField.toString()}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Has Part No. Field</TableCell>
                                        <TableCell>{parseAnalysis.meta.hasPartNoField.toString()}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Invalid Fields</TableCell>
                                        <TableCell>{parseAnalysis.meta.invalidFields.length}</TableCell>
                                        <TableCell><Check /></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => onConfirm()}>
                            Confirm
                        </Button>
                    </div>
                </>
            )}
            {data.length > 0 && (
                <>
                    <div className="text-xl">Summary</div>
                    <div className="w-full border rounded-lg p-4 space-y-4">
                        Successfully updated {data.length} records.
                    </div>
                </>
            )}
        </>
    )
}