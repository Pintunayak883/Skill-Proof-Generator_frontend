"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import FormField from "../../../../components/FormField";
import Card from "../../../../components/Card";
import ProgressBar from "../../../../components/ProgressBar";
import { submitPersonalInfo } from "../../../../lib/api";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{6,}$/, "Phone must be at least 6 digits"),
});

type PersonalFormData = z.infer<typeof schema>;

export default function PersonalPage({ params }: { params: { link: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: PersonalFormData) {
    setLoading(true);
    setError("");
    try {
      const res = await submitPersonalInfo(params.link, data);
      // Save sessionId for next steps
      sessionStorage.setItem("candidate_info", JSON.stringify(data));
      sessionStorage.setItem(
        "candidate_session_id",
        res.data.candidate.sessionId,
      );
      sessionStorage.setItem("candidate_id", res.data.candidate.id);
      router.push(`/candidate/${params.link}/skills`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Failed to submit personal info";
      if (err?.response?.status === 409) {
        // Already registered – pull existing session from sessionStorage or let them proceed
        setError(msg + ". You may already be registered.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <p className="text-xs text-gray-600">Step 2 of 5</p>
          <ProgressBar current={2} total={5} />
        </div>

        <Card title="Personal Information">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            <FormField label="Full Name" error={errors.name?.message}>
              <input
                className="w-full border p-2 rounded text-sm"
                placeholder="John Doe"
                {...register("name")}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <input
                className="w-full border p-2 rounded text-sm"
                placeholder="john@example.com"
                type="email"
                {...register("email")}
              />
            </FormField>

            <FormField label="Phone" error={errors.phone?.message}>
              <input
                className="w-full border p-2 rounded text-sm"
                placeholder="1234567890"
                {...register("phone")}
              />
            </FormField>

            <button
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Next"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
