// Types for the Skill Proof Generator frontend

export type UserRole = "hr" | "candidate";

export interface HRUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface JobPosition {
  id: string;
  title: string;
  skills: string[];
  level: "junior" | "mid" | "senior";
  description: string;
  createdAt: Date;
}

export interface TestLink {
  id: string;
  code: string;
  jobPositionId: string;
  status: "active" | "expired" | "closed";
  createdAt: Date;
  expiresAt: Date;
}

export interface CandidateSubmission {
  id: string;
  testLinkId: string;
  name: string;
  email: string;
  phone: string;
  resume?: File;
  skills?: string;
  experience?: string;
  projects?: string;
  answer: string;
  submittedAt: Date;
  integrityFlags: string[];
}

export interface SkillProofReport {
  id: string;
  submissionId: string;
  overallScore: number;
  skillsMatch: Record<string, number>;
  verdict: "pass" | "fail" | "review";
  integrityStatus: "clean" | "flagged" | "severe";
  confidence: number;
  aiReview: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

export interface SkillsData {
  mode: "upload" | "manual";
  file?: File;
  skills?: string;
  experience?: string;
  projects?: string;
}
