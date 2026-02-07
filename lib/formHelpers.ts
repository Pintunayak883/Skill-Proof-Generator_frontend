"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useRHF, UseFormProps } from "react-hook-form";
import * as z from "zod";

/**
 * Custom hook to integrate React Hook Form with Zod validation
 * Reduces boilerplate in components
 */
export function useForm<T extends z.ZodType<any, any>>(
  schema: T,
  options?: Omit<UseFormProps, "resolver">,
) {
  const form = useRHF({
    ...options,
    resolver: zodResolver(schema),
  });

  return form;
}

/**
 * Helper to format form errors for display
 */
export function getFieldError(errors: Record<string, any>, field: string) {
  return errors[field]?.message || "";
}
