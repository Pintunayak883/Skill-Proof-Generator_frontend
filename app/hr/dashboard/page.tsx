"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "../../../components/Card";
import {
  generateTestLink,
  getJobPositions,
  getReports,
  getTestLinks,
} from "../../../lib/api";
import { getAuthToken } from "../../../lib/auth";

type JobPosition = {
  id: string;
  title: string;
  requiredSkills: string[];
  experienceLevel: string;
  description?: string;
  createdAt: string;
};

type TestLink = {
  id: string;
  jobPositionId: string;
  token: string;
  expiryDate: string;
  isExpired: boolean;
  createdAt: string;
};

type ReportSummary = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  inferredSkillLevel: string;
  evaluationVerdictPlainEnglish: string;
  integrityStatus: string;
  confidenceAssessment: string;
  reportGeneratedAt: string;
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "links" | "submissions">(
    "jobs",
  );
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [links, setLinks] = useState<TestLink[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.origin;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      if (!getAuthToken()) {
        setError("Please login first");
        setIsLoading(false);
        return;
      }

      try {
        const [jobsRes, linksRes, reportsRes] = await Promise.all([
          getJobPositions(),
          getTestLinks(),
          getReports(),
        ]);
        setJobs(jobsRes.data.positions || []);
        setLinks(linksRes.data.testLinks || []);
        setReports(reportsRes.data.reports || []);
      } catch (err: any) {
        const message =
          err.response?.data?.error ||
          err.message ||
          "Failed to load dashboard data.";
        setError(message);
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateLink = async (jobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await generateTestLink(jobId);
      const linksRes = await getTestLinks();
      setLinks(linksRes.data.testLinks || []);
      setActiveTab("links");
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to generate test link.";
      setError(message);
      console.error("Generate link error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderJobs = () => {
    if (isLoading) {
      return <div className="text-sm text-gray-600">Loading jobs...</div>;
    }

    if (!jobs.length) {
      return (
        <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
          <p>📋 Job positions you've created will appear here.</p>
          <p className="mt-2">
            Click "Create Job Position" above to add a new role.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="border rounded p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{job.title}</div>
                <div className="text-xs text-gray-500">
                  {job.experienceLevel} • {job.requiredSkills.join(", ")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateLink(job.id)}
                  className="mt-2 px-3 py-1.5 text-xs border rounded hover:bg-gray-50 transition"
                >
                  Generate Test Link
                </button>
              </div>
            </div>
            {job.description && (
              <p className="text-sm text-gray-600 mt-2">{job.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderLinks = () => {
    if (isLoading) {
      return <div className="text-sm text-gray-600">Loading test links...</div>;
    }

    if (!links.length) {
      return (
        <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
          <p>🔗 Generated test links will be shown here.</p>
          <p className="mt-2">
            Create a job and generate a test link to share with candidates.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {links.map((link) => {
          const shareUrl = baseUrl
            ? `${baseUrl}/candidate/${link.token}/instructions`
            : link.token;
          return (
            <div key={link.id} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Token: {link.token}</div>
                  <div className="text-xs text-gray-500">
                    Expires: {new Date(link.expiryDate).toLocaleDateString()} •
                    {link.isExpired ? " Expired" : " Active"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50 transition"
                >
                  Copy Link
                </button>
              </div>
              <div className="text-xs text-gray-600 mt-2 break-all">
                {shareUrl}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderReports = () => {
    if (isLoading) {
      return <div className="text-sm text-gray-600">Loading reports...</div>;
    }

    if (!reports.length) {
      return (
        <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
          <p>📊 Reports will appear here after candidates submit.</p>
          <p className="mt-2">Share a test link to start collecting results.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="border rounded p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{report.candidateName}</div>
                <div className="text-xs text-gray-500">
                  {report.jobTitle} • {report.inferredSkillLevel}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Verdict: {report.evaluationVerdictPlainEnglish} • Integrity:{" "}
                  {report.integrityStatus}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {new Date(report.reportGeneratedAt).toLocaleDateString()}
                </div>
                <Link
                  href={`/hr/submission/${report.id}`}
                  className="mt-2 inline-block px-3 py-1.5 text-xs border rounded hover:bg-gray-50 transition"
                >
                  View Report
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">HR Dashboard</h1>
          <Link
            href="/hr/job/create"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Create Job Position
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Manage job positions, test links, and candidate submissions
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "jobs" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          Job Positions
        </button>
        <button
          onClick={() => setActiveTab("links")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "links" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          Test Links
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "submissions" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          Submissions
        </button>
      </div>

      {activeTab === "jobs" && (
        <div className="space-y-3">
          <Card title="Management of Job Positions">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded mb-3">
                {error}
              </div>
            )}
            {renderJobs()}
          </Card>
        </div>
      )}

      {activeTab === "links" && (
        <div className="space-y-3">
          <Card title="Test Links">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded mb-3">
                {error}
              </div>
            )}
            {renderLinks()}
          </Card>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="space-y-3">
          <Card title="Candidate Submissions & Results">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded mb-3">
                {error}
              </div>
            )}
            {renderReports()}
          </Card>
        </div>
      )}
    </div>
  );
}
