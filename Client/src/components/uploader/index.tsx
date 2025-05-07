"use client";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  addedFile: string;
  onChange: (file: string) => void;
}

export default function FileUploader({
  addedFile,
  onChange,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const ALLOWED_FORMATS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const CLOUDINARY_UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
  const CLOUDINARY_CLOUD_NAME =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await axios.post(CLOUDINARY_UPLOAD_URL, data, {
        withCredentials: false,
      });

      toast.success("File uploaded successfully");
      onChange(res.data.secure_url);
      return res.data.secure_url;
    } catch (error: any) {
      toast.error(error.message || "Error uploading file");
      console.error(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const validateFile = (file: File) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Megabits

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size should not exceed 2 Megabits");
    }
    if (!ALLOWED_FORMATS.includes(file.type)) {
      throw new Error("Unsupported file format");
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      // Take only the first file
      const file = acceptedFiles[0];
      validateFile(file);
      await uploadFile(file);
    } catch (error: any) {
      toast.error(error.message || "Error uploading file");
      console.error(error);
    }
  };

  const removeFile = (ev: React.MouseEvent) => {
    ev.preventDefault();
    if (isUploading) {
      toast.error("Please wait for current upload to complete");
      return;
    }
    onChange("");
  };

  const getFileIcon = (url: string) => {
    if (typeof url !== "string") {
      return "📁"; // Return a default icon if `url` is not a string
    }
    const extension = url.split(".").pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      jpg: "📷",
      jpeg: "📷",
      png: "📷",
      webp: "📷",
      svg: "📷",
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
    };
    return iconMap[extension || ""] || "📁";
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "image/webp": [],
      "image/svg+xml": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    disabled: isUploading,
    maxFiles: 1,
  });

  return (
    <div className="w-full mt-4">
      {/* Display the uploaded file if exists */}
      {addedFile ? (
        <div className="relative flex items-center p-4 border rounded mb-4 bg-skyBlue/10 hover:bg-skyBlue/20">
          <span className="mr-3 text-3xl">{getFileIcon(addedFile)}</span>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm text-gray-700 dark:text-gray-300">
              {addedFile.split("/").pop() || addedFile}
            </p>
            <a
              href={addedFile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate hover:underline"
            >
              View file
            </a>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="ml-auto text-slate hover:text-slate/90 p-2"
            disabled={isUploading}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="transition border border-skyBlue border-dashed cursor-pointer dark:hover:border-slate dark:border-gray-700 rounded-xl hover:border-slate">
          <div
            {...getRootProps()}
            className={`dropzone rounded-xl border-dashed p-7 lg:p-10
                ${
                  isDragActive
                    ? "border-slate bg-skyBlue/10 hover:bg-skyBlue/20 dark:bg-gray-800"
                    : "border-gray-300 bg-skyBlue/10 hover:bg-skyBlue/20 dark:border-gray-700 dark:bg-gray-900"
                }
                ${isUploading ? "opacity-70 pointer-events-none" : ""}
              `}
          >
            {/* Hidden Input */}
            <input {...getInputProps()} />
            <div className="flex flex-col items-center m-0">
              {/* Icon Container */}
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-peach text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <svg
                    className="fill-current"
                    width="29"
                    height="28"
                    viewBox="0 0 29 28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                    />
                  </svg>
                </div>
              </div>
              {/* Text Content */}
              <h4 className="mb-3 font-semibold text-gray-800 text-lg dark:text-white/90">
                {isUploading
                  ? "Uploading..."
                  : isDragActive
                  ? "Drop File Here"
                  : "Drag & Drop File Here"}
              </h4>
              <span className="text-center mb-4 block w-full max-w-md text-sm text-gray-700 dark:text-gray-400">
                Drag and drop your PNG, JPG, WebP, SVG images or document files
                here or browse
              </span>
              <span className="font-medium underline text-sm text-slate">
                Browse File
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
