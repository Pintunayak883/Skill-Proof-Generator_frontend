# Skill Proof Generator - Frontend

## Overview

Next.js 14 + React 18 frontend for the Skill Proof Generator platform. Features a complete candidate assessment flow with anti-cheating detection and secure test environment.

## Tech Stack

- **Framework:** Next.js 14 (TypeScript)
- **UI:** React 18 + Tailwind CSS
- **HTTP Client:** Axios
- **File Upload:** UploadThing
- **Deployment:** Vercel
- **Port:** 3000

## Project Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page
├── globals.css            # Global styles
├── hr/                    # HR Dashboard
│   ├── dashboard/page.tsx (violation reports)
│   ├── job/create/page.tsx (create job positions)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── submission/[id]/page.tsx (candidate submissions)
└── candidate/
    └── [link]/            # Dynamic candidate flow
        ├── instructions/page.tsx (test info)
        ├── personal/page.tsx (personal details)
        ├── skills/page.tsx (skill input/upload)
        ├── test/page.tsx (dynamic assessment)
        ├── results/page.tsx (test results)
        └── submit/page.tsx (final submission)

components/
├── Button.tsx
├── Card.tsx
├── FileUpload.tsx
├── FormField.tsx
├── Input.tsx
├── Modal.tsx (warnings)
├── ProgressBar.tsx
└── ResumeUpload.tsx (UploadThing integration)

lib/
├── api.ts (Axios client)
├── antiCheat.ts (deprecated - now in test page)
├── auth.ts (authentication logic)
├── formHelpers.ts (form utilities)
├── types.ts (TypeScript interfaces)
└── validators.ts (input validation)

public/
└── manifest.json
```

## Key Features

### 1. Candidate Registration Flow

**Page: `/candidate/[link]/personal`**

- Name, email, phone, location
- Phone validation (international formats)
- Session ID stored in sessionStorage

**Page: `/candidate/[link]/skills`**

- Resume upload via UploadThing
- OR manual skill entry
- Skill analysis with AI
- Inferred skill level (Beginner/Intermediate/Experienced)

### 2. Dynamic Assessment Test

**Page: `/candidate/[link]/test`**

- One-question-at-a-time flow
- Question display with:
  - Question type (Conceptual/Coding/Scenario)
  - Difficulty level
  - Context and hints
- Answer submission with validation (min 50 characters)
- Real-time violation counter (X/4)
- Escalating warning messages

### 3. Advanced Anti-Cheating Detection

**Implemented in test/page.tsx:**

**Tab Switching Detection**

- `visibilitychange` event listener
- Logs violation when user leaves tab

**Copy/Paste Prevention**

- Prevents keyboard shortcuts (Ctrl+C, Ctrl+V, Cmd+C, Cmd+V)
- Blocks right-click context menu
- Logs all copy/paste attempts

**Keyboard Shortcut Detection**

- Detects Alt+Tab
- Detects Ctrl+Alt+Delete
- Blocks suspicious key combinations

**Violation Thresholds (4-Strike System)**

- 1st violation: ⚠️ Warning (3 second display)
- 2nd violation: ⚠️⚠️ Strong warning
- 3rd violation: ⚠️⚠️⚠️ Final warning
- 4th violation: 🚫 Auto-submit test, lock access

### 4. Test Results Page

**Page: `/candidate/[link]/results`**

- Overall score
- Recommendation (Recommended/Consider/Not Recommended)
- Summary assessment
- Strengths and areas for improvement
- Answer-by-answer evaluation

### 5. HR Dashboard

**Pages: `/hr/login`, `/hr/register`, `/hr/dashboard`**

- Login/Register for HR users
- View violation reports
- Create job positions
- Review candidate submissions
- Flagged sessions for cheating review

## API Integration

All API calls use `apiClient` from `lib/api.ts`:

### Assessment Endpoints

- `GET /assessment/{token}/question` - Fetch next question
- `POST /assessment/{token}/submit-answer` - Submit answer
- `POST /assessment/{token}/log-violation` - Log cheating violation
- `GET /assessment/{token}/status` - Get test status
- `POST /assessment/{token}/submit-test` - Submit test

### Candidate Endpoints

- `POST /candidate/{link}/resume` - Upload resume
- `POST /candidate/{link}/skills` - Submit skills
- `GET /candidate/{link}/resume` - Get resume analysis

### Auth Endpoints

- `POST /auth/register` - Register candidate/HR
- `POST /auth/login` - Login user

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
UPLOADTHING_APP_ID=your_app_id
```

## State Management

### Test Page Component State

```typescript
const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
const [answer, setAnswer] = useState("");
const [questionNumber, setQuestionNumber] = useState(0);
const [totalQuestions, setTotalQuestions] = useState(5);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [submitting, setSubmitting] = useState(false);
const [testStatus, setTestStatus] = useState("InProgress");
const [violationCount, setViolationCount] = useState(0);
const [warningMessage, setWarningMessage] = useState<string | null>(null);
const [showWarning, setShowWarning] = useState(false);
```

### Session Storage

- `candidate_session_id`: Unique session identifier
- Persists across page refreshes
- Required for assessment access

## Component Examples

### ResumeUpload Component

```typescript
- UploadThing integration
- File type validation (PDF, DOCX, TXT)
- Upload progress tracking
- Error handling with retry
```

### Test Page Component

```typescript
- Fetches questions dynamically
- Handles answer submission
- Manages violation logging
- Displays warnings with auto-dismiss
- Auto-routes to results on completion
```

### Modal Component

```typescript
- Displays warnings and notifications
- Dismissible with auto-close timer
- Used for violation warnings
```

## Styling

- **Framework:** Tailwind CSS
- **Components:** Custom components with Tailwind classes
- **Responsive:** Mobile-first design
- **Colors:** Blue/Gray theme for professional look

## Installation & Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000

# Build for production
npm run build

# Start production build
npm start
```

## Key Functions

### Session Management

```typescript
const sessionId = sessionStorage.getItem("candidate_session_id");
sessionStorage.setItem("candidate_session_id", newSessionId);
```

### API Calls

```typescript
const response = await apiClient.get(`/assessment/${token}/question`);
const response = await apiClient.post(`/assessment/${token}/log-violation`, {
  sessionId,
  violationType,
  description,
  metadata,
});
```

### Anti-Cheating Event Listeners

```typescript
document.addEventListener("visibilitychange", handleVisibilityChange);
document.addEventListener("copy", handleCopy);
document.addEventListener("paste", handlePaste);
document.addEventListener("keydown", handleKeyDown);
```

## Security Features

- Session validation on every request
- Token-based test access
- Copy/paste blocking in test
- Tab switching detection
- Keyboard shortcut prevention
- Violation thresholds with auto-submit
- XSS protection via React
- CORS configuration on backend

## Testing Checklist

- ✅ Resume upload with UploadThing
- ✅ Personal info submission
- ✅ Skills page with resume analysis
- ✅ Test page loads dynamically
- ✅ Answer submission and evaluation
- ✅ Tab switch violation detection
- ✅ Copy/paste blocking
- ✅ Keyboard shortcut detection
- ✅ Warning display (1st-3rd violation)
- ✅ Auto-submit on 4th violation
- ✅ Results page display
- ✅ Session persistence across refreshes

## Features Status

- ✅ Candidate personal info form
- ✅ Resume upload & analysis
- ✅ Skills manual/auto input
- ✅ Dynamic question display
- ✅ Answer submission & evaluation
- ✅ Tab switch detection
- ✅ Copy/paste prevention
- ✅ Keyboard shortcut blocking
- ✅ Real-time violation counter
- ✅ Escalating warnings
- ✅ Auto-submit on 4th violation
- ✅ Results display
- ✅ HR dashboard (basic)
- 📋 Camera monitoring (optional)
- 📋 Advanced analytics (optional)

## Common Issues & Solutions

**Session not found error:**

- Ensure personal info page is completed first
- Check sessionStorage in DevTools
- Clear storage and restart if needed

**Resume upload fails:**

- Check UploadThing credentials in .env
- Verify file type (PDF, DOCX, TXT)
- Check browser console for error details

**Questions not loading:**

- Verify backend API is running on 5000
- Check NEXT_PUBLIC_API_URL in .env
- Verify test token is valid

**Violations not logging:**

- Check backend assessment routes are registered
- Verify session validation middleware
- Check MongoDB connection for violation logs

## Deployment

- Deploy to Vercel with `npm run build`
- Set environment variables in Vercel dashboard
- Ensure backend API is accessible from frontend domain
- Configure CORS on backend for frontend domain

## Support

For issues, check browser console logs and network tab for API responses.
