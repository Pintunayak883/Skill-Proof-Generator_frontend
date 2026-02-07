"use client";

import Link from "next/link";
import { getDashboardStats } from "../lib/api";

export default function Home() {
  const checkConnection = async () => {
    try {
      console.info("[home] checking backend connection...");
      const res = await getDashboardStats();
      console.info("[home] backend ok:", res.status, res.data);
    } catch (error) {
      console.error("[home] backend error:", error);
    }
  };

  return (
    <div className="container">
      <div className="bg-white rounded-lg p-8 shadow">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome — Skill Proof Generator
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Create, send and review AI-evaluated candidate assessments.
        </p>
        <div className="flex gap-3">
          <Link
            href="/hr/login"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            HR Login
          </Link>
          <Link href="/hr/register" className="px-4 py-2 border rounded">
            HR Register
          </Link>
          <button
            type="button"
            onClick={checkConnection}
            className="px-4 py-2 border rounded"
          >
            Test API
          </button>
        </div>
      </div>
    </div>
  );
}
