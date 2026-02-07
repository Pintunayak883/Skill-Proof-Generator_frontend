"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../../../components/Card";
import ProgressBar from "../../../../components/ProgressBar";
import FormField from "../../../../components/FormField";
import { uploadResume, submitManualInput } from "../../../../lib/api";

export default function SkillsPage({ params }: { params: { link: string } }) {
  const router = useRouter();
  const [mode, setMode] = useState<"upload" | "manual">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualData, setManualData] = useState({
    skills: "",
    experience: "",
    projects: "",
  });

  async function next() {
    if (mode === "upload" && !file) {
      alert("Please upload a resume file");
      return;
    }
    if (mode === "manual" && !manualData.skills.trim()) {
      alert("Please enter your skills");
      return;
    }

    const sessionId = sessionStorage.getItem("candidate_session_id");
    if (!sessionId) {
      setError(
        "Session not found. Please go back and fill personal info first.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "upload" && file) {
        const res = await uploadResume(params.link, file, sessionId);
        sessionStorage.setItem(
          "resume_analysis",
          JSON.stringify(res.data.analysis),
        );
      } else {
        const skills = manualData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const res = await submitManualInput(params.link, {
          sessionId,
          skills,
          experienceDescription:
            manualData.experience || "No experience provided",
          projectsDescription: manualData.projects || "No projects provided",
        });
        sessionStorage.setItem(
          "resume_analysis",
          JSON.stringify(res.data.analysis),
        );
      }

      sessionStorage.setItem(
        "candidate_skills",
        JSON.stringify({ mode, file: file?.name, ...manualData }),
      );
      router.push(`/candidate/${params.link}/test`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to process skills";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <p className="text-xs text-gray-600">Step 3 of 5</p>
          <ProgressBar current={3} total={5} />
        </div>

        <Card title="Skills & Experience">
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              Choose how you'd like to provide your skills:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("upload")}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  mode === "upload"
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-50"
                }`}
              >
                Upload Resume
              </button>
              <button
                onClick={() => setMode("manual")}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  mode === "manual"
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-50"
                }`}
              >
                Manual Input
              </button>
            </div>
          </div>

          <div>
            {mode === "upload" ? (
              <div className="p-4 border-2 border-dashed rounded text-center">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
                {file && (
                  <p className="mt-2 text-sm text-green-600">✓ {file.name}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <FormField label="Key Skills">
                  <textarea
                    value={manualData.skills}
                    onChange={(e) =>
                      setManualData({ ...manualData, skills: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm resize-none"
                    rows={3}
                    placeholder="e.g., TypeScript, React, Node.js, PostgreSQL"
                  />
                </FormField>

                <FormField label="Work Experience">
                  <textarea
                    value={manualData.experience}
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        experience: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded text-sm resize-none"
                    rows={3}
                    placeholder="Describe your professional background and relevant roles..."
                  />
                </FormField>

                <FormField label="Notable Projects">
                  <textarea
                    value={manualData.projects}
                    onChange={(e) =>
                      setManualData({ ...manualData, projects: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm resize-none"
                    rows={3}
                    placeholder="List or describe important projects you've worked on..."
                  />
                </FormField>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t">
            <button
              onClick={next}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Next"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50 transition"
            >
              Back
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
