"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { reportEvent, useAntiCheat } from "../../../../lib/antiCheat";
import { generateTask, submitAnswer } from "../../../../lib/api";
import ProgressBar from "../../../../components/ProgressBar";
import Modal from "../../../../components/Modal";

import ReactMarkdown from "react-markdown";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme

export default function TestPage({ params }: { params: { link: string } }) {
  const router = useRouter();
  const [text, setText] = useState("// Write your solution here...\n\n");
  const [submitted, setSubmitted] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  
  // Use a ref for the editor container to detect focus/blur if needed
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Restored missing refs
  const violationCountRef = useRef(0);
  const hasTypedRef = useRef(false);
  const lastInputAtRef = useRef<number | null>(null);
  const idleWarnedRef = useRef(false);

  // AI-generated task state
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [skillSessionId, setSkillSessionId] = useState("");
  const [taskLoading, setTaskLoading] = useState(true);
  const [taskError, setTaskError] = useState("");

  // Timing metrics
  const pageLoadedAtRef = useRef(Date.now());
  const firstKeystrokeAtRef = useRef<number | null>(null);
  const tabSwitchCountRef = useRef(0);
  const blurCountRef = useRef(0);
  const copyCountRef = useRef(0);
  const focusLossCountRef = useRef(0);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState("");

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false, 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setCameraError("Camera access required for proctoring.");
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Load AI-generated task on mount
  useEffect(() => {
    const sessionId = sessionStorage.getItem("candidate_session_id");
    if (!sessionId) {
      setTaskError("Session not found. Please fill personal info first.");
      setTaskLoading(false);
      return;
    }

    generateTask(params.link, sessionId)
      .then((res) => {
        setTaskName(res.data.task.taskName);
        setTaskDescription(res.data.task.taskDescription);
        setSkillSessionId(res.data.skillSessionId);
        pageLoadedAtRef.current = Date.now();
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || "Failed to generate task";
        setTaskError(msg);
      })
      .finally(() => setTaskLoading(false));
  }, [params.link]);

  function warn(message: string) {
    setWarnings((prev) => [...prev.slice(-3), message]);
    setModalMsg(message);
    setShowModal(true);
  }

  useAntiCheat({
    onViolation: (type) => {
      recordViolation(type, true);
    },
  });

  // Prevent right click
  useEffect(() => {
    const handleContext = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", handleContext);
    return () => document.removeEventListener("contextmenu", handleContext);
  }, []);

  // Idle check
  useEffect(() => {
    const idleCheck = setInterval(() => {
      if (submitted || !hasTypedRef.current || !lastInputAtRef.current) return;
      
      const idleMs = Date.now() - lastInputAtRef.current;
      if (idleMs > 60000 && !idleWarnedRef.current) {
        idleWarnedRef.current = true;
        recordViolation("IDLE_TIMEOUT", true);
      }
    }, 1000);
    return () => clearInterval(idleCheck);
  }, [params.link, submitted]);

  function captureSnapshot(): string | null {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.7);
      }
    }
    return null;
  }

  async function doSubmit(reason?: string) {
    if (submitted) return;
    setSubmitted(true);

    const now = Date.now();
    const totalTimeSec = Math.round((now - pageLoadedAtRef.current) / 1000);
    const delayBeforeTypingSec = firstKeystrokeAtRef.current
      ? Math.round(
          (firstKeystrokeAtRef.current - pageLoadedAtRef.current) / 1000,
        )
      : totalTimeSec;
    const typingDurationSec = firstKeystrokeAtRef.current
      ? Math.round((now - firstKeystrokeAtRef.current) / 1000)
      : 0;

    const behaviorMetrics = {
      totalTimeSeconds: totalTimeSec,
      delayBeforeTypingSeconds: delayBeforeTypingSec,
      typingDurationSeconds: typingDurationSec,
      idleTimeSeconds: 0,
      answerLength: text.length,
      tabSwitchCount: tabSwitchCountRef.current,
      windowBlurCount: blurCountRef.current,
      copyAttemptCount: copyCountRef.current,
      focusLossCount: focusLossCountRef.current,
    };

    const snapshot = captureSnapshot();
    const snapshots = snapshot ? [snapshot] : [];

    if (skillSessionId) {
      try {
        await submitAnswer(skillSessionId, {
          explanation: text || "(auto-submitted)",
          behaviorMetrics,
          snapshots,
        });
      } catch (e) {
        console.error("[test] submit error", e);
      }
    }

    reportEvent(params.link, reason ? "AUTO_SUBMIT" : "SUBMISSION", {
      charCount: text.length,
      reason,
    });
    setTimeout(() => router.push(`/candidate/${params.link}/submit`), 800);
  }

  function autoSubmit(reason: string) {
    doSubmit(reason);
  }

  function recordViolation(type: string, shouldReport: boolean) {
    if (submitted) return;

    if (type === "TAB_SWITCH" || type === "WINDOW_BLUR") tabSwitchCountRef.current += 1;
    if (type === "WINDOW_BLUR") blurCountRef.current += 1;
    if (type === "COPY_ATTEMPT" || type === "PASTE_ATTEMPT") copyCountRef.current += 1;
    if (type === "FOCUS_LOSS" || type === "IDLE_TIMEOUT") focusLossCountRef.current += 1;

    violationCountRef.current += 1;
    warn(`⚠️ ${type} detected. Please stay focused on the test.`);
    if (shouldReport) reportEvent(params.link, type);
  }

  function submit() {
    if (text.trim().length < 50) {
      warn("Please write a longer answer (min 50 characters)");
      return;
    }
    doSubmit();
  }

  return (
    <div className="container min-h-screen bg-gray-50 pb-10">
      <Modal
        isOpen={showModal}
        title="Activity Warning"
        message={modalMsg}
        onDismiss={() => setShowModal(false)}
      />

      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Skill Assessment</h2>
          <p className="text-xs text-gray-500">Official Candidate Test Environment</p>
        </div>
        <div className="text-right flex items-center gap-4">
           <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-red-600 font-bold border border-gray-200">
             <Timer initialSeconds={1800} />
           </div>
           <button
             disabled={submitted || text.trim().length < 50}
             onClick={submit}
             className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
           >
             {submitted ? "Submitted" : "Submit Test"}
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex gap-6 align-start h-[calc(100vh-80px)]">
        
        {/* Left Panel: Task Description */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <h3 className="font-semibold text-gray-700">Task Instructions</h3>
             <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 font-medium">Read Carefully</span>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 prose prose-sm prose-blue max-w-none">
             {taskLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                   <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-gray-500 text-sm">Generating personalized task...</p>
                </div>
             ) : taskError ? (
                <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
                   {taskError}
                </div>
             ) : (
                <>
                   <h2 className="text-xl font-bold text-gray-800 mb-4">{taskName}</h2>
                   <ReactMarkdown>{taskDescription}</ReactMarkdown>
                </>
             )}
          </div>
        </div>

        {/* Right Panel: Editor & Camera */}
        <div className="w-1/2 flex flex-col gap-4 h-full">
           
           {/* Camera Preview (Top Right) */}
           <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="relative w-32 h-20 bg-black rounded overflow-hidden shadow-inner">
                    <video 
                       ref={videoRef} 
                       autoPlay 
                       muted 
                       playsInline 
                       className="w-full h-full object-cover"
                    />
                    {!videoRef.current?.srcObject && !cameraError && (
                       <div className="absolute inset-0 flex items-center justify-center text-white text-[10px]">Thinking...</div>
                    )}
                 </div>
                 <div>
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       Proctoring Active
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Webcam monitoring is on.</p>
                 </div>
              </div>
              <div className="text-xs text-right text-gray-400">
                 <p>ID: {params.link.substring(0,8)}</p>
                 <p>v2.1.0-secure</p>
              </div>
              <canvas ref={canvasRef} className="hidden" />
           </div>

           {/* Code Editor */}
           <div className="flex-1 bg-[#2d2d2d] rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-700">
              <div className="bg-[#1e1e1e] px-4 py-2 border-b border-gray-700 flex justify-between items-center text-gray-300 text-xs">
                 <span className="font-mono">solution.js</span>
                 <span>JavaScript (BabeL)</span>
              </div>
              <div className="flex-1 overflow-y-auto relative font-mono text-sm editor-container" ref={editorContainerRef}>
                 <Editor
                    value={text}
                    onValueChange={(code: string) => {
                       setText(code);
                       if (!hasTypedRef.current) hasTypedRef.current = true;
                       lastInputAtRef.current = Date.now();
                       if (!firstKeystrokeAtRef.current) firstKeystrokeAtRef.current = Date.now();
                       idleWarnedRef.current = false;
                    }}
                    highlight={(code: string) => highlight(code, languages.js, 'javascript')}
                    padding={16}
                    style={{
                       fontFamily: '"Fira Code", "Fira Mono", monospace',
                       fontSize: 14,
                       backgroundColor: "#2d2d2d",
                       color: "#f8f8f2",
                       minHeight: "100%",
                    }}
                    disabled={submitted}
                    className="min-h-full"
                    textareaClassName="focus:outline-none"
                 />
              </div>
              <div className="bg-[#1e1e1e] px-4 py-1 border-t border-gray-700 text-right text-[10px] text-gray-500">
                 {text.length} chars
              </div>
           </div>
           
           {warnings.length > 0 && (
             <div className="bg-amber-50 border-l-4 border-amber-500 p-3 shadow-sm rounded-r">
                <p className="text-xs font-bold text-amber-800">Violation Detected</p>
                <p className="text-xs text-amber-700">{warnings[warnings.length - 1]}</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

function Timer({ initialSeconds }: { initialSeconds: number }) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  return (
    <span>
      {mm}:{ss}
    </span>
  );
}
