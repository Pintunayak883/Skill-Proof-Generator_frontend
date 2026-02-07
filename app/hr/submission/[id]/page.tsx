"use client";
import React, { useEffect, useMemo, useState } from "react";
import Card from "../../../../components/Card";
import { getReportDetail } from "../../../../lib/api";

type ReportDetail = {
  report: {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    inferredSkillLevel: string;
    taskGiven: string;
    answerSummary: string;
    evaluationVerdictPlainEnglish: string;
    strengths: string[];
    weaknesses: string[];
    thinkingInsight: string;
    timeAndBehaviorInsight: string;
    integrityStatus: "Clean" | "Flagged";
    confidenceAssessment:
      | "Overconfidence"
      | "Underconfidence"
      | "Accurate confidence";
    reportGeneratedAt: string;
  };
  evaluation: {
    evaluation?: {
      explanationScore?: number;
      verdict?: string;
      strengths?: string[];
      weaknesses?: string[];
      confidenceInsight?: string;
    };
    behaviorMetrics?: {
      totalTimeSeconds?: number;
      delayBeforeTypingSeconds?: number;
      typingDurationSeconds?: number;
      idleTimeSeconds?: number;
      answerLength?: number;
      tabSwitchCount?: number;
      windowBlurCount?: number;
      copyAttemptCount?: number;
      focusLossCount?: number;
    };
  } | null;
  session: {
    taskDescription?: string;
    candidateAnswer?: string;
    pseudoCode?: string;
    submittedAt?: string;
  } | null;
};

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "overview",
  );
  const [data, setData] = useState<ReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getReportDetail(params.id);
        setData(response.data);
      } catch (err: any) {
        const message =
          err.response?.data?.error || err.message || "Failed to load report.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  const scorePercent = useMemo(() => {
    const rawScore = data?.evaluation?.evaluation?.explanationScore;
    if (typeof rawScore !== "number") {
      return null;
    }
    return Math.round(Math.min(Math.max(rawScore * 10, 0), 100));
  }, [data]);

  if (isLoading) {
    return <div className="container">Loading report...</div>;
  }

  if (error) {
    return <div className="container text-sm text-red-700">{error}</div>;
  }

  if (!data) {
    return <div className="container">No report data found.</div>;
  }

  const { report, evaluation, session } = data;
  const behavior = evaluation?.behaviorMetrics || {};

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto">
        <Card title="Skill Proof Report">
          <div className="space-y-4">
            {/* Header */}
            <div className="pb-4 border-b">
              <h2 className="text-lg font-semibold">{report.candidateName}</h2>
              <p className="text-sm text-gray-600">{report.jobTitle}</p>
              <p className="text-xs text-gray-500 mt-1">
                Reported: {new Date(report.reportGeneratedAt).toLocaleString()}
              </p>
            </div>

            {/* Score & Verdict */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-tiny text-gray-600">Overall Score</div>
                <div className="text-2xl font-bold text-blue-600">
                  {scorePercent ?? "N/A"}%
                </div>
              </div>
              <div
                className={`p-3 rounded ${report.evaluationVerdictPlainEnglish.includes("Understands") ? "bg-green-50" : "bg-amber-50"}`}
              >
                <div className="text-xs text-gray-600">Verdict</div>
                <div
                  className={`text-lg font-bold ${report.evaluationVerdictPlainEnglish.includes("Understands") ? "text-green-600" : "text-amber-600"}`}
                >
                  {report.evaluationVerdictPlainEnglish}
                </div>
              </div>
              <div
                className={`p-3 rounded ${report.integrityStatus === "Clean" ? "bg-green-50" : "bg-amber-50"}`}
              >
                <div className="text-xs text-gray-600">Integrity</div>
                <div
                  className={`text-sm font-bold ${report.integrityStatus === "Clean" ? "text-green-600" : "text-amber-600"}`}
                >
                  {report.integrityStatus.toUpperCase()}
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <div className="text-xs text-gray-600">Confidence</div>
                <div className="text-lg font-bold text-purple-600">
                  {report.confidenceAssessment}
                </div>
              </div>
            </div>

            {/* Question & Answer */}
            <div>
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "question" ? null : "question",
                  )
                }
                className="w-full text-left font-medium text-sm p-3 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                Question & Answer
                <span className="text-xs">
                  {expandedSection === "question" ? "−" : "+"}
                </span>
              </button>
              {expandedSection === "question" && (
                <div className="p-3 mt-1 border rounded space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Task</div>
                    <div className="text-sm font-medium">
                      {report.taskGiven}
                    </div>
                    {session?.taskDescription && (
                      <p className="text-sm text-gray-600 mt-1">
                        {session.taskDescription}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Answer</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {session?.candidateAnswer || report.answerSummary}
                    </p>
                  </div>
                  {session?.pseudoCode && (
                    <div>
                      <div className="text-xs text-gray-500">Pseudo Code</div>
                      <pre className="text-xs bg-gray-50 border rounded p-2 whitespace-pre-wrap">
                        {session.pseudoCode}
                      </pre>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500">Answer Accuracy</div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-600 h-2 rounded"
                        style={{ width: `${scorePercent ?? 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {scorePercent ?? "N/A"}% based on AI evaluation score
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Breakdown */}
            <div>
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "skills" ? null : "skills",
                  )
                }
                className="w-full text-left font-medium text-sm p-3 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                Skills Match
                <span className="text-xs">
                  {expandedSection === "skills" ? "−" : "+"}
                </span>
              </button>
              {expandedSection === "skills" && (
                <div className="p-3 space-y-2 mt-1 border rounded">
                  <div>
                    <div className="text-xs text-gray-500">Strengths</div>
                    <ul className="text-sm text-gray-700 list-disc pl-4">
                      {(report.strengths || []).map((strength) => (
                        <li key={strength}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Weaknesses</div>
                    <ul className="text-sm text-gray-700 list-disc pl-4">
                      {(report.weaknesses || []).map((weakness) => (
                        <li key={weakness}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* AI Review */}
            <div>
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "review" ? null : "review",
                  )
                }
                className="w-full text-left font-medium text-sm p-3 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                AI Evaluation
                <span className="text-xs">
                  {expandedSection === "review" ? "−" : "+"}
                </span>
              </button>
              {expandedSection === "review" && (
                <div className="p-3 mt-1 border rounded bg-gray-50 text-sm text-gray-700 space-y-2">
                  <p>{report.thinkingInsight}</p>
                  <p>{report.timeAndBehaviorInsight}</p>
                </div>
              )}
            </div>

            {/* Behavior Metrics */}
            <div>
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "behavior" ? null : "behavior",
                  )
                }
                className="w-full text-left font-medium text-sm p-3 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                Behavior Metrics
                <span className="text-xs">
                  {expandedSection === "behavior" ? "−" : "+"}
                </span>
              </button>
              {expandedSection === "behavior" && (
                <div className="p-3 mt-1 border rounded text-sm text-gray-700 space-y-2">
                  <div>Total time: {behavior.totalTimeSeconds ?? 0}s</div>
                  <div>
                    Delay before typing:{" "}
                    {behavior.delayBeforeTypingSeconds ?? 0}s
                  </div>
                  <div>
                    Typing duration: {behavior.typingDurationSeconds ?? 0}s
                  </div>
                  <div>Idle time: {behavior.idleTimeSeconds ?? 0}s</div>
                  <div>Answer length: {behavior.answerLength ?? 0} chars</div>
                  <div>Tab switches: {behavior.tabSwitchCount ?? 0}</div>
                  <div>Window blurs: {behavior.windowBlurCount ?? 0}</div>
                  <div>Copy attempts: {behavior.copyAttemptCount ?? 0}</div>
                  <div>Focus losses: {behavior.focusLossCount ?? 0}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3">
              <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50 transition">
                Download PDF
              </button>
              <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50 transition">
                Compare Candidates
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
