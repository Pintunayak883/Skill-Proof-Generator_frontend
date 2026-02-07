"use client";
import React from "react";
import Link from "next/link";
import Card from "../../../../components/Card";

export default function SubmitPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center space-y-4">
            <div className="text-4xl">✓</div>
            <h2 className="text-xl font-semibold">Assessment Submitted</h2>
            <p className="text-sm text-gray-700">
              Thank you for completing the Skill Proof assessment. Your response
              has been recorded and will be evaluated by our AI system.
            </p>
            <div className="bg-blue-50 p-3 rounded text-xs text-gray-700">
              <p className="font-medium mb-1">What happens next?</p>
              <p>
                The hiring team will review your AI-evaluated Skill Proof Report
                and contact you if you advance in the process.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
