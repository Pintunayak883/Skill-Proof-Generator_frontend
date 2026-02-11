/**
 * UploadThing Router Configuration (Client-Side)
 *
 * This defines the file upload endpoint for the frontend
 * Mirrors the backend configuration in src/lib/uploadthing.ts
 *
 * Features:
 * - PDF only validation
 * - 4MB file size limit
 * - MIME type checking
 * - Error handling
 */

import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

/**
 * File Router for Skill Proof Generator
 * Handles resume uploads from candidates
 */
export const uploadRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "4MB" },
  })
    .middleware(async (req) => {
      // Optional: Add authentication check here
      // Get user from session/token if needed
      // For now, allowing anonymous uploads with token validation on backend

      return {
        userId: "anonymous",
        uploadedAt: new Date().toISOString(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ File uploaded successfully:", {
        fileKey: file.key,
        fileName: file.name,
        fileUrl: file.url,
        fileSize: file.size,
        fileType: file.type,
      });

      // Return file data to frontend
      return {
        fileKey: file.key,
        fileUrl: file.url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
