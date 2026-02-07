"use client";
import React from "react";

export default function Modal({
  isOpen,
  title,
  message,
  onDismiss,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <button
          onClick={onDismiss}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
