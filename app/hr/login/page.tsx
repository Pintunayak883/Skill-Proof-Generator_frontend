"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormField from "../../../components/FormField";
import { signIn } from "../../../lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError(null);

    try {
      console.info("[login] submitting...");
      const result = await signIn(data);
      console.info("[login] success:", result.ok);
      // Redirect to dashboard on success
      router.push("/hr/dashboard");
    } catch (err: any) {
      console.error("[login] error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-sm w-full bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-1">HR Portal</h2>
        <p className="text-sm text-gray-600 mb-6">
          Sign in to manage assessments
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              className="w-full border p-2 rounded text-sm"
              placeholder="you@company.com"
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <input
              type="password"
              {...register("password")}
              className="w-full border p-2 rounded text-sm"
              placeholder="••••••"
            />
          </FormField>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-4">
          Don't have an account?{" "}
          <Link href="/hr/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
