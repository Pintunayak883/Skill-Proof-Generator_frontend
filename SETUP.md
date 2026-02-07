# Skill Proof Generator Frontend — Full Setup & Deployment Guide

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:4000`

### Step 1: Install Dependencies

```bash
cd client
npm install
```

### Step 2: Environment Variables

Create `.env.local` in the `client/` directory:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

For production, update to your backend URL:

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Step 3: Run Development Server

```bash
npm run dev
```

Navigate to **http://localhost:3000**

---

## Project Structure

```
client/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Tailwind styles
│   ├── hr/
│   │   ├── login/               # HR sign-in
│   │   ├── register/            # HR sign-up
│   │   ├── dashboard/           # HR main dashboard
│   │   └── job/create/          # Create job position
│   └── candidate/
│       └── [link]/
│           ├── instructions/    # Rules & info (Step 1)
│           ├── personal/        # Personal details (Step 2)
│           ├── skills/          # Resume/manual input (Step 3)
│           ├── test/            # Monitored test (Step 4)
│           └── submit/          # Confirmation (Step 7)
│
├── components/                   # Reusable UI
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── ProgressBar.tsx
│   ├── FormField.tsx
│   └── FileUpload.tsx
│
├── lib/                         # Core utilities
│   ├── api.ts                   # API calls & axios setup
│   ├── antiCheat.ts             # Anti-cheat hooks & event reporting
│   ├── auth.ts                  # Auth helpers (login/register)
│   ├── validators.ts            # Zod validation schemas
│   └── types.ts                 # TypeScript interfaces
│
├── public/                      # Static assets
│   └── manifest.json            # PWA metadata
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── README.md
```

---

## Key Features Implemented

### 1. HR Flow

- **Authentication**: Login & Register pages
- **Dashboard**: Overview of jobs and test links
- **Job Creation**: Form to create positions with skills, level, description
- **Test Link Generation**: (Placeholder for backend integration)
- **Results Viewing**: (Placeholder for backend integration)

### 2. Candidate Flow (No Login Required)

- **Step 1 — Instructions**: Full-screen mode, rules, integrity warnings
- **Step 2 — Personal Details**: Name, email, phone (validated)
- **Step 3 — Skills Input**: Resume upload (PDF/DOCX) or manual entry
- **Step 4 — Test Interface**: Monitored textarea with anti-cheat detection
- **Step 5 — Answer Input**: Large textarea with character counter
- **Step 6 — Submit & Lock**: Disable editing after submit
- **Step 7 — Confirmation**: Thank-you screen

### 3. Anti-Cheat Monitoring

- ✅ Tab switch detection via `document.visibilitychange`
- ✅ Window blur via `window.blur`
- ✅ Copy/paste prevention via keyboard listeners
- ✅ Right-click context menu disabled
- ✅ Event reporting to backend
- ✅ Visual warnings in modals

### 4. Form Validation

- **Zod schemas** for all forms (login, register, personal info, jobs)
- **React Hook Form** integration for UX
- **Real-time field errors** on FormField component

### 5. Styling

- **Tailwind CSS** for responsive, minimal UI
- **Global styles** in `app/globals.css`
- **Component-level classes** for reusability
- **Dark-friendly, accessible colors**

---

## API Integration

The frontend expects these endpoints on your backend:

### HR Endpoints

```
POST   /auth/register          # HR registration
POST   /auth/login             # HR login
GET    /jobs                   # List job positions
POST   /jobs                   # Create job position
GET    /testlinks              # List test links
POST   /testlinks              # Generate test link
GET    /submissions            # List candidate submissions
GET    /submissions/:id        # View submission details
```

### Candidate Endpoints

```
POST   /candidate/:link/event           # Report anti-cheat event
POST   /candidate/:link/submit          # Submit test response
POST   /candidate/:link/upload-resume   # Upload resume (optional)
```

Example API call from lib/api.ts:

```typescript
export async function createJobPosition(data: any) {
  return axios.post(`${API_BASE}/jobs`, data);
}

export async function sendCandidateEvent(link: string, eventType: string) {
  return axios.post(`${API_BASE}/candidate/${link}/event`, { type: eventType });
}
```

---

## Building & Deployment

### Build Production Bundle

```bash
npm run build
npm start
```

### Vercel Deployment (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker Deployment

Create `Dockerfile` in client/:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build & run:

```bash
docker build -t skill-proof-client .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.your-domain.com skill-proof-client
```

---

## Testing

### Unit Tests (Optional)

```bash
npm install --save-dev jest @testing-library/react
```

### Running Tests

```bash
npm test
```

---

## Performance Optimizations

1. **Code Splitting**: Next.js automatically splits code by page
2. **Image Optimization**: Use `next/image` for images
3. **Font Optimization**: Inline system fonts in globals.css
4. **API Caching**: Use axios interceptors for request/response caching
5. **Lazy Loading**: Components are lazy-loaded by default in Next.js

---

## Environment-Specific Configuration

### Development

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Staging

```
NEXT_PUBLIC_API_URL=https://api-staging.your-domain.com
```

### Production

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## Common Issues & Solutions

### Issue: "API call returns 404"

**Solution:** Check that backend is running and `NEXT_PUBLIC_API_URL` is correct.

### Issue: "Tailwind styles not loading"

**Solution:** Run `npm run build` and check `tailwind.config.js` content paths include all file extensions.

### Issue: "Anti-cheat events not sent"

**Solution:** Ensure backend is listening on the event endpoint and check network tab in DevTools.

### Issue: "Form validation not working"

**Solution:** Check Zod schema matches form fields and `hookForm@resolver` is correctly applied.

---

## Tech Stack & Versions

| Package         | Version | Purpose               |
| --------------- | ------- | --------------------- |
| Next.js         | 14.0.0  | React framework       |
| React           | 18.2.0  | UI library            |
| TypeScript      | 5.4.2   | Type safety           |
| Tailwind CSS    | 3.5.0   | Styling               |
| React Hook Form | 7.43.2  | Form state management |
| Zod             | 4.22.0  | Schema validation     |
| Axios           | 1.4.0   | HTTP client           |

---

## Support & Debugging

### Enable Debug Logging

In `lib/antiCheat.ts`:

```typescript
function reportEvent(testLink: string, type: string) {
  console.log("[AntiCheat]", type); // Add this line
  api.sendCandidateEvent(testLink, type);
}
```

### Check Browser DevTools

- **Network tab**: Verify API calls are being made
- **Console**: Check for JS errors
- **Application**: View stored session data in localStorage/sessionStorage

---

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push: `git push origin feature/new-feature`

---

## License

Proprietary — Skill Proof Generator Platform. All rights reserved.
