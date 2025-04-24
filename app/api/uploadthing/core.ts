import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  counselorDocument: f({ image: { maxFileSize: "4MB" }, pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      // Verify user is authenticated
      return { };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata);
      console.log("file url", file.url);
      return { uploadedBy: metadata, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 