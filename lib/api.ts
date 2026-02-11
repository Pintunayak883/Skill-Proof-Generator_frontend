import axios from "axios";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

if (typeof window !== "undefined") {
  console.info("[api] baseURL:", API_BASE);
}

// Get token from localStorage
function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

// Create axios instance with auth header
export const apiClient = axios.create({
  baseURL: API_BASE,
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof window !== "undefined") {
    console.debug("[api] request:", config.method, config.url);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== "undefined") {
      console.debug("[api] response:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      const status = error?.response?.status;
      const url = error?.config?.url;
      console.error("[api] error:", status, url, error?.message);
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export async function loginHR(email: string, password: string) {
  return apiClient.post("/auth/login", { email, password });
}

export async function registerHR(
  name: string,
  email: string,
  password: string,
  company: string,
) {
  return apiClient.post("/auth/register", {
    name,
    email,
    password,
    company,
  });
}

// Job Position endpoints
export async function createJobPosition(data: any) {
  return apiClient.post(`/hr/positions`, data);
}

export async function getJobPositions() {
  return apiClient.get(`/hr/positions`);
}

export async function getJobPositionById(id: string) {
  return apiClient.get(`/hr/positions/${id}`);
}

export async function generateTestLink(
  jobPositionId: string,
  expiryDays?: number,
) {
  return apiClient.post(`/hr/test-links`, {
    jobPositionId,
    expiryDays,
  });
}

export async function getTestLinks() {
  return apiClient.get(`/hr/test-links`);
}

export async function getReports() {
  return apiClient.get(`/hr/dashboard/reports`);
}

export async function getReportDetail(reportId: string) {
  return apiClient.get(`/hr/dashboard/reports/${reportId}`);
}

// Candidate endpoints
export async function submitPersonalInfo(
  link: string,
  data: { name: string; email: string; phone: string },
) {
  return apiClient.post(`/candidate/${link}/personal-info`, data);
}

export async function uploadResume(
  link: string,
  file: File,
  sessionId: string,
) {
  // Note: File upload should go through UploadThing
  // This function is deprecated - use ResumeUpload component instead
  console.warn(
    "uploadResume is deprecated. Use ResumeUpload component or upload to UploadThing first",
  );

  // For now, throw an error to encourage using UploadThing
  throw new Error(
    "Resume uploads must use UploadThing. Please use the ResumeUpload component.",
  );
}

export async function submitManualInput(
  link: string,
  data: {
    sessionId: string;
    skills: string[];
    experienceDescription: string;
    projectsDescription: string;
  },
) {
  return apiClient.post(`/candidate/${link}/manual-input`, data);
}

export async function generateTask(link: string, sessionId: string) {
  return apiClient.post(`/candidate/${link}/task`, { sessionId });
}

export async function submitAnswer(
  skillSessionId: string,
  data: {
    explanation: string;
    pseudoCode?: string;
    behaviorMetrics: any;
    snapshots?: string[];
  },
) {
  return apiClient.post(
    `/candidate/skill-session/${skillSessionId}/submit`,
    data,
  );
}

export async function sendCandidateEvent(
  link: string,
  eventType: string,
  payload: any = {},
) {
  return apiClient.post(`/candidate/${link}/event`, {
    type: eventType,
    payload,
  });
}

export async function submitCandidate(link: string, body: any) {
  return apiClient.post(`/candidate/${link}/submit`, body);
}

// Dashboard endpoints
export async function getDashboardStats() {
  return apiClient.get(`/hr/dashboard/stats`);
}
