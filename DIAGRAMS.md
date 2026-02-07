# System Architecture Diagrams

## Application Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SKILL PROOF GENERATOR PLATFORM                      │
│                            Frontend (Next.js 14)                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐     ┌────────────────────────────┐
│          HR AUTHENTICATED FLOW        │     │   CANDIDATE LINK-BASED     │
│                                       │     │       (NO LOGIN)           │
├──────────────────────────────────────┤     ├────────────────────────────┤
│  .../hr/                              │     │  .../candidate/[link]/     │
│  ├─ login          ────────┐          │     │  ├─ instructions           │
│  ├─ register       ────────┤          │     │  ├─ personal               │
│  ├─ dashboard              ├──────┐   │     │  ├─ skills                 │
│  │  ├─ jobs      (create)  │      │   │     │  ├─ test  ← MONITORED      │
│  │  ├─ links               │      │   │     │  └─ submit                 │
│  │  └─ submissions         │      │   │     │                            │
│  └─ submission/:id         │      │   │     └────────────────────────────┘
│        (view report)       │      │   │
└──────────────┬─────────────┘      │   │
               │                    │   │
            [JWT]                   │   │
               │                    ▼   ▼
               │              ┌──────────────────┐
               │              │  FORM VALIDATION │
               │              │   (Zod Schemas)  │
               │              │  React Hook Form │
               │              └──────────────────┘
               │                    │
               ▼                    ▼
        ┌─────────────────────────────────────┐
        │       NEXT.JS APP ROUTER            │
        │   (Client-side only, no SSR)        │
        │                                     │
        │  • Page routing                     │
        │  • Component management             │
        │  • SessionStorage for forms         │
        └─────────────────────────────────────┘
               │
               ▼
        ┌─────────────────────────────────────┐
        │      ANTI-CHEAT MONITORING          │
        │       (Test Page Only)              │
        │                                     │
        │  • document.visibilitychange        │
        │  • window.blur                      │
        │  • keydown (Ctrl+C / Ctrl+V)       │
        │  • contextmenu (disabled)           │
        │  • Events → Backend                 │
        └─────────────────────────────────────┘
               │
               ▼
        ┌─────────────────────────────────────┐
        │        AXIOS API CLIENT             │
        │       (lib/api.ts)                  │
        │                                     │
        │  GET  /jobs                         │
        │  POST /jobs                         │
        │  GET  /submissions                  │
        │  POST /candidate/:link/event        │
        │  POST /candidate/:link/submit       │
        │  POST /auth/login                   │
        │  POST /auth/register                │
        └─────────────────────────────────────┘
               │
               ▼
        ┌─────────────────────────────────────┐
        │        BACKEND API SERVER           │
        │   (Your Node.js/Express server)     │
        │   Running on http://localhost:4000  │
        │                                     │
        │  • Authentication & JWT             │
        │  • Job CRUD                         │
        │  • Submission storage               │
        │  • Integrity log                    │
        │  • AI evaluation                    │
        │  • Report generation                │
        └─────────────────────────────────────┘
```

---

## Candidate Test Flow (Detailed)

```
Start Test
    │
    ▼
Step 1: Instructions
├─ Display rules
├─ Warn about monitoring
└─ Button: "Start Test"
    │
    ▼
Step 2: Personal Info
├─ Form: name, email, phone
├─ Validation (Zod)
└─ Save → sessionStorage
    │
    ▼
Step 3: Skills/Resume
├─ Choice: Upload OR Manual
├─ If Upload:
│  └─ Accept .pdf, .docx
├─ If Manual:
│  ├─ Skills
│  ├─ Experience
│  └─ Projects
├─ Validate input
└─ Save → sessionStorage
    │
    ▼
Step 4: TEST INTERFACE ⚠️ MONITORED
├─ Enforce full-screen (optional)
├─ Show timer (30 min)
├─ Show question
├─ Answer textarea
│
├─ ANTI-CHEAT ACTIVE
│  ├─ Tab switch? → Warning modal → Report event
│  ├─ Window blur? → Warning modal → Report event
│  ├─ Copy? → Block → Report event
│  ├─ Paste? → Block → Report event
│  └─ Right-click? → Block
│
├─ Input validation
│  └─ Min 50 chars
│
└─ Button submission
    │
    ▼
Step 5: SUBMIT DATA
├─ POST /candidate/:link/submit
│  └─ {
│       name, email, phone,
│       skills/resume, answer,
│       integrityFlags: [events]
│     }
├─ Lock form (no editing)
└─ Show "Submitted..."
    │
    ▼
Step 6: CONFIRMATION
├─ "Thank you" screen
├─ "Results will be shared"
└─ Done
    │
    ▼
BACKEND PROCESSES
├─ Store submission
├─ Log integrity events
├─ Run AI evaluation
├─ Generate Skill Proof Report
└─ Notify HR
    │
    ▼
HR REVIEWS
├─ Visit /hr/submission/:id
├─ View report + scores
├─ See integrity flags
└─ Make hiring decision
```

---

## Component Hierarchy

```
┌─────────────────────────────────┐
│      app/layout.tsx             │ ← Root wrapper
│              │                  │   • Header
│              │                  │   • Footer
│              ▼                  │   • Global styles
│         <main>                  │
│             │                   │
└─────────────┼───────────────────┘
              │
    ┌─────────┼─────────────┐
    │         │             │
    ▼         ▼             ▼
  HR Flow  Candidate Flow  Homepage
    │         │
    ├─ Login   ├─ Instructions
    │  Reg.    ├─ Personal
    ├─ Dash.   ├─ Skills
    │  │       ├─ Test
    │  │       └─ Submit
    │  └─ Job/Sub
    │
    └─ COMPONENTS USED:
       └─ Card
       └─ FormField
       └─ ProgressBar
       └─ Modal
       └─ Button
       └─ Input
```

---

## State Management Flow

```
CANDIDATE FLOW STATE MANAGEMENT

Step 2: Personal Info
    ↓
sessionStorage.setItem('candidate_info', JSON.stringify({
  name, email, phone
}))
    ↓
Step 3: Skills/Resume
    ↓
sessionStorage.setItem('candidate_skills', JSON.stringify({
  mode: 'upload' | 'manual',
  file: ...,
  skills, experience, projects
}))
    ↓
Step 4: Test Interface
    ↓
localStorage.setItem('test_answer', answerText) ← Auto-save draft
    ↓
Step 5: Submit
    ↓
POST /candidate/:link/submit with all accumulated data
    ↓
Backend stores ✓
Frontend clears sessionStorage
```

---

## Anti-Cheat Event Flow

```
TEST PAGE COMPONENT
    │
    ├─ useAntiCheat() hook activated
    │
    ├─ MONITOR 1: document.visibilitychange
    │  └─ Hidden? → onViolation('TAB_SWITCH')
    │
    ├─ MONITOR 2: window.blur
    │  └─ Lost focus? → onViolation('WINDOW_BLUR')
    │
    ├─ MONITOR 3: keydown
    │  └─ Ctrl+C or Ctrl+V? → onViolation('COPY_PASTE')
    │
    ├─ MONITOR 4: contextmenu
    │  └─ Right-click? → preventDefault()
    │
    └─ MONITOR 5: textarea onCopy/onPaste
       └─ preventDefault() + onViolation('COPY_ATTEMPT')


When violation detected:
    │
    ├─ Show warning modal
    ├─ Play sound (optional)
    ├─ Update UI counter
    │
    └─ reportEvent(testLink, type)
        │
        └─ POST /candidate/:link/event
            └─ Backend logs to IntegrityLog table
```

---

## Data Structure Example

### Candidate Submission Payload

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "5551234567",
  "mode": "manual",
  "skills": "TypeScript, React, Node.js, PostgreSQL",
  "experience": "5 years as full-stack developer at startup",
  "projects": "Built SaaS platform, led team of 3",
  "answer": "I would architect this as a microservice...",
  "integrityFlags": ["TAB_SWITCH@14:35:00Z", "COPY_ATTEMPT@14:36:15Z"]
}
```

### HR Submission Report Response

```json
{
  "id": "sub_123",
  "candidateName": "John Doe",
  "jobPosition": "Senior Backend Engineer",
  "submittedAt": "2024-02-05T14:40:00Z",
  "answer": "...",
  "overallScore": 82,
  "skillsMatch": {
    "TypeScript": 85,
    "System Design": 78,
    "Database Design": 88
  },
  "verdict": "pass",
  "integrityStatus": "flagged",
  "confidence": 91,
  "aiReview": "Strong technical understanding...",
  "integrityEvents": [{ "type": "TAB_SWITCH", "timestamp": "14:35:00Z" }]
}
```

---

## Folder Navigation

```
CLIENT (Next.js 14 Frontend)
│
├─ PUBLIC/
│  └─ manifest.json ← PWA metadata
│
├─ APP/ ← Next.js App Router pages (auto-routed)
│  │
│  ├─ /              ← Homepage
│  ├─ /hr/login      ← HR sign in
│  ├─ /hr/register   ← HR sign up
│  ├─ /hr/dashboard  ← HR main experience
│  ├─ /hr/job/create ← Create job
│  ├─ /hr/submission/[id] ← View report
│  │
│  ├─ /candidate/[link]/           ← Link-based test flow
│  │  ├─ /instructions
│  │  ├─ /personal
│  │  ├─ /skills
│  │  ├─ /test        ← MONITORED
│  │  └─ /submit
│  │
│  ├─ layout.tsx     ← Root layout + header/footer
│  └─ globals.css    ← Tailwind CSS
│
├─ COMPONENTS/ ← Reusable presentational components
│  ├─ Button.tsx       ← CTA buttons
│  ├─ Card.tsx         ← Container
│  ├─ Input.tsx        ← Text input
│  ├─ FormField.tsx    ← Label + Input + Error
│  ├─ Modal.tsx        ← Dialog (warnings)
│  ├─ ProgressBar.tsx  ← Step indicator
│  └─ FileUpload.tsx   ← File input
│
├─ LIB/ ← Pure utilities & hooks (not React)
│  ├─ api.ts           ← Axios client + endpoints
│  ├─ antiCheat.ts     ← useAntiCheat hook + event reporting
│  ├─ auth.ts          ← Auth helpers (signup/login)
│  ├─ validators.ts    ← Zod schemas
│  ├─ formHelpers.ts   ← React Hook Form wrappers
│  └─ types.ts         ← TypeScript interfaces
│
├─ .env.example         ← Environment template
├─ .gitignore
├─ package.json         ← Dependencies
├─ tsconfig.json        ← TypeScript config
├─ next.config.js       ← Next.js config
├─ tailwind.config.cjs  ← Tailwind theming
├─ postcss.config.cjs   ← PostCSS config
│
└─ DOCS/
   ├─ README.md         ← Quick start
   ├─ QUICK_START.md    ← 30-sec setup + reference
   ├─ SETUP.md          ← Full setup & deployment
   ├─ ARCHITECTURE.md   ← System design (20+ pages)
   ├─ INDEX.md          ← File navigation
   └─ DELIVERY.md       ← This delivery summary
```

---

## Integration Points

```
┌──────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js)                                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  lib/api.ts (Axios)                               │  │
│  │                                                   │  │
│  │  export async function createJobPosition(data) {  │  │
│  │    return axios.post('/jobs', data)               │  │
│  │  }                                                │  │
│  │                                                   │  │
│  │  export async function sendCandidateEvent(...) {  │  │
│  │    return axios.post('/candidate/:link/event', ...) │  │
│  │  }                                                │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
         │                                    │
         │ HTTP POST/GET                      │
         │ (REST API)                         │
         │                                    │
         ▼                                    ▼
┌──────────────────────────────────────────────────────────┐
│  BACKEND SERVER (Node.js/Express)                        │
│                                                          │
│  POST   /auth/register                                   │
│  POST   /auth/login                                      │
│  GET    /jobs                                            │
│  POST   /jobs                                            │
│  GET    /submissions                                     │
│  GET    /submissions/:id                                 │
│  POST   /candidate/:link/event   ← Integrity logging     │
│  POST   /candidate/:link/submit  ← Test submission       │
│                                                          │
│  Database: HR users, jobs, candidates, submissions      │
│  AI: Evaluate answers → Skill Proof Report              │
│  Logging: Integrity events                              │
└──────────────────────────────────────────────────────────┘
```

---

**Last Updated**: February 2024
