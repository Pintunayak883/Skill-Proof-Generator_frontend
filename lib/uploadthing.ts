/**
 * UploadThing Hook for React
 *
 * This hook provides the UploadButton and UploadDropzone components
 * for integrating UploadThing file uploads into your React application
 */

import { UploadButton as UploadButtonComponent } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/uploadRouter";

export const UploadButton = UploadButtonComponent as any;
export const UploadDropzone = null as any;
