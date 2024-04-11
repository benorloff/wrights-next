import { CsvUpload } from "@/components/csv-upload";
import { Input } from "@/components/ui/input";

const UploadPage = async () => {
    return (
        <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4 p-4">
            <h1>CSV Upload Page</h1>
            <CsvUpload />
        </div>
    )
}

export default UploadPage;