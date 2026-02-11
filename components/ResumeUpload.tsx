/**
 * Resume Upload Component
 *
 * Handles resume file upload using UploadThing
 * Integrates with the backend for resume analysis
 *
 * Features:
 * - PDF upload with UploadThing
 * - File validation (5MB, PDF only)
 * - Progress indication
 * - Error handling
 * - Automatic backend submission
 */

"use client";

import React, { useState, useEffect } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { apiClient } from "@/lib/api";
import type { OurFileRouter } from "@/app/api/uploadthing/uploadRouter";
import { uploadRouter } from "@/app/api/uploadthing/uploadRouter";

interface ResumeUploadProps {
  token: string;
  sessionId: string;
  onSuccess?: (analysis: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ResumeUpload({
  token,
  sessionId,
  onSuccess,
  onError,
  className = "",
}: ResumeUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resolvedSessionId, setResolvedSessionId] = useState<string | null>(
    sessionId || null,
  );

  // Ensure sessionId is available from sessionStorage if not passed as prop
  useEffect(() => {
    if (!resolvedSessionId && typeof window !== "undefined") {
      const id = sessionStorage.getItem("candidate_session_id");
      setResolvedSessionId(id);
    }
  }, [resolvedSessionId]);

  const handleUploadComplete = async (res: any[]) => {
    console.log("[ResumeUpload] onClientUploadComplete called with:", res);

    if (!res || res.length === 0) {
      const errorMsg = "No file uploaded to UploadThing";
      setError(errorMsg);
      onError?.(errorMsg);
      console.error("❌ No file data received");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(50);

      const file = res[0];
      console.log("[ResumeUpload] Raw file object:", file);

      // Normalize property names (UploadThing might use different naming)
      const fileData = {
        fileName: file.fileName || file.name,
        fileUrl: file.fileUrl || file.url,
        fileKey: file.fileKey || file.key,
        fileMimeType: file.fileMimeType || file.type || "application/pdf",
      };

      console.log("📤 Normalized file data:", fileData);

      // Verify sessionId is available
      if (!resolvedSessionId) {
        throw new Error(
          "Session ID not found. Please go back and fill personal info first.",
        );
      }

      console.log("📤 File uploaded to UploadThing:", {
        name: fileData.fileName,
        url: fileData.fileUrl,
        key: fileData.fileKey,
        type: fileData.fileMimeType,
      });

      setUploadProgress(70);

      // Send to backend with UploadThing data
      console.log("[ResumeUpload] Sending POST request with body:", {
        sessionId: resolvedSessionId,
        resumeUrl: fileData.fileUrl,
        fileKey: fileData.fileKey,
        fileName: fileData.fileName,
        fileMimeType: fileData.fileMimeType,
      });

      const response = await apiClient.post(`/candidate/${token}/resume`, {
        sessionId: resolvedSessionId,
        resumeUrl: fileData.fileUrl,
        fileKey: fileData.fileKey,
        fileName: fileData.fileName,
        fileMimeType: fileData.fileMimeType,
      });

      setUploadProgress(90);

      if (response.status !== 200) {
        throw new Error(response.data?.error || "Resume upload failed");
      }

      const result = response.data;
      console.log("✅ Resume analyzed successfully:", result.analysis);

      setUploadProgress(100);
      setAnalysis(result.analysis);
      onSuccess?.(result.analysis);

      // Reset after success
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (err: any) {
      let errorMsg = "Unknown error";
      let errorDetails = "";

      if (err?.response?.data?.error) {
        errorMsg = err.response.data.error;
        errorDetails = JSON.stringify(err.response.data, null, 2);
      } else if (err?.response?.data) {
        errorMsg = "Backend error";
        errorDetails = JSON.stringify(err.response.data, null, 2);
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      console.error("❌ Resume upload error:", errorMsg);
      console.error("📋 Error details:", errorDetails);
      console.error("🔧 Full error:", err);

      setError(errorMsg);
      onError?.(errorMsg);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadError = (error: any) => {
    const errorMsg = error.message || "Upload failed";
    console.error("❌ Upload error:", errorMsg);
    setError(errorMsg);
    onError?.(errorMsg);
  };

  return (
    <div
      className={`w-full max-w-md mx-auto p-6 border rounded-lg ${className}`}
    >
      <h2 className="text-2xl font-bold mb-4">Upload Resume</h2>

      {/* Upload Button */}
      <div className="mb-6">
        <UploadButton<typeof uploadRouter>
          endpoint="resumeUploader"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          appearance={{
            button: "ut-uploading:opacity-50 bg-blue-600 hover:bg-blue-700",
            container: "w-full",
          }}
          disabled={isLoading}
        />
      </div>

      {/* Progress Bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Processing...</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded mb-4">
          <div className="animate-spin mr-2 text-blue-600">⏳</div>
          <p className="text-blue-900">Processing resume...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-bold text-green-900 mb-3">Analysis Results</h3>

          <div className="space-y-3">
            {/* Suggested Level */}
            <div>
              <p className="text-sm text-gray-600">Suggested Level</p>
              <p className="text-lg font-semibold text-green-700">
                {analysis.suggestedLevel}
              </p>
            </div>

            {/* Confidence Score */}
            <div>
              <p className="text-sm text-gray-600">Confidence Score</p>
              <div className="flex items-center gap-2">
                {/* Convert confidence string to percentage */}
                {(() => {
                  const confidenceMap = { High: 0.9, Medium: 0.6, Low: 0.3 };
                  const confValue =
                    confidenceMap[
                      analysis.confidence as keyof typeof confidenceMap
                    ] || 0;
                  const percentage = Math.round(confValue * 100);
                  return (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {analysis.confidence || "N/A"} ({percentage}%)
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Matched Skills */}
            {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Matched Skills</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-green-200 text-green-800 text-sm rounded-full"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {analysis.missingSkills && analysis.missingSkills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                    >
                      ⚠ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
        <p className="font-semibold mb-2">ℹ️ Upload Requirements</p>
        <ul className="list-disc list-inside space-y-1">
          <li>File Format: PDF only</li>
          <li>Maximum Size: 5MB</li>
          <li>Processing time: 2-5 seconds</li>
        </ul>
      </div>
    </div>
  );
}

// Export types for use in other components
export type { ResumeUploadProps };
