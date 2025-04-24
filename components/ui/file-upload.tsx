import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: keyof OurFileRouter;
}

export const FileUpload = ({
  onChange,
  value,
  endpoint
}: FileUploadProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {value ? (
        <div className="flex flex-col items-center gap-4 w-full">
          {value.endsWith(".pdf") ? (
            <iframe
              src={value}
              className="w-full h-64 border rounded-lg"
            />
          ) : (
            <img
              src={value}
              alt="Upload"
              className="rounded-lg w-full h-64 object-cover"
            />
          )}
          <button
            onClick={() => onChange("")}
            className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600"
          >
            Remove file
          </button>
        </div>
      ) : (
        <UploadDropzone<OurFileRouter, "counselorDocument">
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            onChange(res?.[0].url);
          }}
          onUploadError={(error: Error) => {
            console.log(error);
          }}
        />
      )}
    </div>
  );
};