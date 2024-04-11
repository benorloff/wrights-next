import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();

const handleAuth = async () => {
    const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return { userId: user.id };
}
 
const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
    csvUploader: f({ "text/csv": { maxFileSize: "2MB", maxFileCount: 1 } })
        .middleware(async () => handleAuth())
        .onUploadComplete(async (res) => {
            const { name, url, size, type } = res.file;
        // This code RUNS ON YOUR SERVER after upload
        // console.log("Upload complete for userId:", metadata.userId);
    
        // console.log("file url", file.url);
    
        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { name, url, size, type };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;