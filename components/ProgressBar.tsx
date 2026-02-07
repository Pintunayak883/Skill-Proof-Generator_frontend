"use client";
import React from "react";

export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
