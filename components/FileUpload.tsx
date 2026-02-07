"use client";
import React, { useState } from "react";

export default function FileUpload({
  onChange,
}: {
  onChange?: (f: File | null) => void;
}) {
  const [name, setName] = useState<string | null>(null);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setName(file?.name ?? null);
    onChange?.(file);
  }

  return (
    <div className="p-4 border rounded">
      <input accept=".pdf,.docx" type="file" onChange={handle} />
      {name && (
        <div className="mt-2 text-sm text-gray-600">Uploaded: {name}</div>
      )}
    </div>
  );
}
