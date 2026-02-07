"use client";
import React from "react";
import Link from "next/link";
import Card from "../../../../components/Card";

export default function InstructionsPage({
  params,
}: {
  params: { link: string };
}) {
  return (
    <div className="container">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <p className="text-xs text-gray-600">Step 1 of 5</p>
        </div>

        <Card title="Assessment Instructions">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-base mb-2">Before You Begin</h3>
              <p className="text-gray-700">
                This is a timed, monitored skill assessment. Please ensure you
                have a stable internet connection and a quiet environment.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-2">
                ✓ What to do:
              </h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>
                  Use your knowledge and skills to answer the question
                  thoughtfully
                </li>
                <li>Type your response directly in the answer field</li>
                <li>Review your answer before submitting</li>
                <li>Answer as if speaking to a technical interviewer</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded">
              <h4 className="font-semibold text-amber-900 mb-2">
                ⚠ Test Rules:
              </h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Do NOT switch tabs or windows during the test</li>
                <li>Do NOT use external tools, AI, or online resources</li>
                <li>Do NOT copy/paste content from other sources</li>
                <li>Exam activity is monitored and recorded</li>
                <li>Violations may result in disqualification</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 p-3 rounded">
              <h4 className="font-semibold text-green-900 mb-2">
                ⏱ Time & Format:
              </h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>30 minutes to complete the assessment</li>
                <li>1 open-ended question</li>
                <li>Response should be at least 50 characters</li>
                <li>Your answer will be AI-evaluated for skill match</li>
              </ul>
            </div>

            <p className="text-xs text-gray-600 italic">
              By clicking "Start Test", you confirm you understand the rules and
              will follow them.
            </p>
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Link
              href={`/candidate/${params.link}/personal`}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
            >
              Start Test
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
