"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormField from "../../../../components/FormField";
import Card from "../../../../components/Card";
import { createJobPosition } from "../../../../lib/api";
import { getAuthToken } from "../../../../lib/auth";

const jobSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  skills: z.string().min(2, "Skills are required"),
  level: z.enum(
    ["Beginner", "Intermediate", "Experienced", "junior", "mid", "senior"],
    {
      invalid_type_error: "Select a level",
    },
  ),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  async function onSubmit(data: JobFormData) {
    setIsLoading(true);
    setError(null);

    try {
      if (!getAuthToken()) {
        setError("Please login first");
        router.push("/hr/login");
        return;
      }

      const levelMap: Record<
        string,
        "Beginner" | "Intermediate" | "Experienced"
      > = {
        junior: "Beginner",
        mid: "Intermediate",
        senior: "Experienced",
        Beginner: "Beginner",
        Intermediate: "Intermediate",
        Experienced: "Experienced",
      };

      const response = await createJobPosition({
        title: data.title,
        requiredSkills: data.skills.split(",").map((s) => s.trim()),
        experienceLevel: levelMap[data.level],
        description: data.description,
      });

      if (response.status === 201) {
        router.push("/hr/dashboard?tab=jobs");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to create job. Please try again.";
      setError(message);
      console.error("Job creation error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link
            href="/hr/dashboard"
            className="text-xs text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <Card title="Create Job Position">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField label="Job Title" error={errors.title?.message}>
              <input
                {...register("title")}
                className="w-full border p-2 rounded text-sm"
                placeholder="e.g., Senior Backend Engineer"
              />
            </FormField>

            <FormField
              label="Required Skills (comma-separated)"
              error={errors.skills?.message}
            >
              <textarea
                {...register("skills")}
                className="w-full border p-2 rounded text-sm resize-none"
                rows={3}
                placeholder="e.g., TypeScript, Node.js, PostgreSQL, System Design"
              />
            </FormField>

            <FormField label="Expected Level" error={errors.level?.message}>
              <select
                {...register("level")}
                className="w-full border p-2 rounded text-sm"
              >
                <option value="">Select a level</option>
                <option value="Beginner">Beginner (0-2 years)</option>
                <option value="Intermediate">Intermediate (2-5 years)</option>
                <option value="Experienced">Experienced (5+ years)</option>
              </select>
            </FormField>

            <FormField
              label="Job Description"
              error={errors.description?.message}
            >
              <textarea
                {...register("description")}
                className="w-full border p-2 rounded text-sm resize-none"
                rows={5}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </FormField>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isLoading ? "Creating..." : "Create Position"}
              </button>
              <Link
                href="/hr/dashboard"
                className="px-4 py-2 border text-sm rounded hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
