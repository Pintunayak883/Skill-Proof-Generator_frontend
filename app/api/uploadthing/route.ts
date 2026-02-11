/**
 * UploadThing API Route
 *
 * This route handles file uploads via UploadThing
 * It's required for the UploadThing SDK to work properly in Next.js
 *
 * Location: app/api/uploadthing/route.ts
 */

import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./uploadRouter";

// Export routes for /api/uploadthing
export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
