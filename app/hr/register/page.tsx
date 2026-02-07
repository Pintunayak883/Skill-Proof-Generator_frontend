"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormField from "../../../components/FormField";
import { registerUser } from "../../../lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setError(null);

    try {
      console.info("[register] submitting...");
      const result = await registerUser(data);
      console.info("[register] success:", result.ok);
      // Redirect to login on success
      router.push("/hr/login?registered=true");
    } catch (err: any) {
      console.error("[register] error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-sm w-full bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-1">Create HR Account</h2>
        <p className="text-sm text-gray-600 mb-6">
          Set up your Skill Proof workspace
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Full Name" error={errors.name?.message}>
            <input
              {...register("name")}
              className="w-full border p-2 rounded text-sm"
              placeholder="Jane Smith"
            />
          </FormField>

          <FormField label="Company Email" error={errors.email?.message}>
            <input
              {...register("email")}
              className="w-full border p-2 rounded text-sm"
              placeholder="jane@company.com"
            />
          </FormField>

          <FormField label="Company Name" error={errors.company?.message}>
            <input
              {...register("company")}
              className="w-full border p-2 rounded text-sm"
              placeholder="Acme Inc."
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <input
              type="password"
              {...register("password")}
              className="w-full border p-2 rounded text-sm"
              placeholder="••••••••"
            />
          </FormField>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white p-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-4">
          Already have an account?{" "}
          <Link href="/hr/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
