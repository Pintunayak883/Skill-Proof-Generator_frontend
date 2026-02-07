# Quick Reference — Skill Proof Generator Frontend

## 🚀 Getting Started (60 seconds)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000**

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 📂 Key Files to Know

| File                                 | Purpose               | When to Edit           |
| ------------------------------------ | --------------------- | ---------------------- |
| `app/page.tsx`                       | Homepage              | Customize landing page |
| `app/hr/login/page.tsx`              | HR sign-in form       | Add/remove fields      |
| `app/candidate/[link]/test/page.tsx` | Exam interface        | Customize test UX      |
| `lib/antiCheat.ts`                   | Anti-cheat hooks      | Add new monitoring     |
| `lib/validators.ts`                  | Form validation       | Update Zod schemas     |
| `lib/api.ts`                         | API client            | Add new endpoints      |
| `tailwind.config.cjs`                | Styling               | Change colors/fonts    |
| `.env.example`                       | Environment variables | Template for setup     |

---

## 🎯 Page Routes

### Public Routes

- `/` — Homepage
- `/hr/login` — HR login
- `/hr/register` — HR register
- `/candidate/:link/instructions` — Test rules
- `/candidate/:link/personal` — Personal info form
- `/candidate/:link/skills` — Resume/manual skills input
- `/candidate/:link/test` — Test interface (monitored)
- `/candidate/:link/submit` — Confirmation page

### Protected Routes (TODO: Add middleware)

- `/hr/dashboard` — HR dashboard (should require auth)
- `/hr/job/create` — Create job (should require auth)
- `/hr/submission/:id` — View results (should require auth)

---

## 🔌 API Endpoints Expected

### Auth

- `POST /auth/register` — Create HR account
- `POST /auth/login` — Sign in HR user

### Jobs

- `GET /jobs` — List job positions
- `POST /jobs` — Create new job

### Submissions

- `GET /submissions` — List candidate submissions
- `GET /submissions/:id` — Get candidate report

### Candidate

- `POST /candidate/:link/event` — Report integrity event
- `POST /candidate/:link/submit` — Submit test response

---

## 🛡️ Anti-Cheat Events

Automatically sent to backend when detected:

```
TAB_SWITCH    — User switched tabs (visibilitychange)
WINDOW_BLUR   — Browser window lost focus
COPY_ATTEMPT  — User tried Ctrl+C
PASTE_ATTEMPT — User tried Ctrl+V
```

Monitor in dev: Open DevTools Network → Search "event"

---

## 🎨 Styling

All styles use **Tailwind CSS**. No CSS files to edit (except `globals.css`).

### Quick Changes

- **Colors**:

  ```tsx
  <button className="bg-blue-600 text-white">  {/* Primary */}
  <button className="bg-green-600 text-white"> {/* Success */}
  <button className="bg-red-600 text-white">   {/* Danger */}
  ```

- **Spacing**:

  ```tsx
  <div className="p-4">      {/* padding: 1rem */}
  <div className="mb-6">     {/* margin-bottom: 1.5rem */}
  <div className="gap-2">    {/* gap in flexbox: 0.5rem */}
  ```

- **Typography**:
  ```tsx
  <h1 className="text-2xl font-semibold"> {/* 24px, bold */}
  <p className="text-sm text-gray-600">    {/* 14px, gray */}
  ```

---

## 📝 Form Handling

All forms use **React Hook Form** + **Zod**.

### Adding a new form field:

1. **Add to Zod schema** (`lib/validators.ts`):

   ```typescript
   const mySchema = z.object({
     username: z.string().min(3, "Too short"),
   });
   ```

2. **Use in component**:

   ```typescript
   const { register, handleSubmit, formState: { errors } } = useForm({
     resolver: zodResolver(mySchema)
   })

   return (
     <form onSubmit={handleSubmit(onSubmit)}>
       <FormField label="Username" error={errors.username?.message}>
         <input {...register('username')} />
       </FormField>
     </form>
   )
   ```

---

## 🔗 Integrating with Backend

All API calls go through **Axios** in `lib/api.ts`.

### Example: Adding a new API call

```typescript
// lib/api.ts
export async function getJobDetails(jobId: string) {
  return axios.get(`${API_BASE}/jobs/${jobId}`);
}

// In component:
import { getJobDetails } from "@/lib/api";

const response = await getJobDetails("123");
console.log(response.data);
```

---

## 🧪 Testing Changes Locally

### Test HR Flow

1. Go to http://localhost:3000/hr/login
2. Fill form → "Sign in"
3. Should redirect to `/hr/dashboard`

### Test Candidate Flow

1. Go to http://localhost:3000/candidate/test-link-123/instructions
2. Click "Start Test"
3. Fill personal details → Next
4. Upload resume or manual entry → Next
5. Answer question → Submit
6. See confirmation page

### Test Anti-Cheat

1. Open test page (step 4)
2. Open DevTools
3. Switch to another tab → Check for console warning + Network event
4. Try to copy text → Should prevent + show warning

---

## 🐛 Debugging

### Common Issues & Fixes

**Q: Page shows 404**

- Check the dynamic route params: `/candidate/[link]/test` expects URL like `/candidate/abc123/test`

**Q: Form fields not validating**

- Check Zod schema in `validators.ts` matches form field names
- Check `resolver: zodResolver(schema)` is passed to `useForm`

**Q: API calls failing with 404**

- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running at that address
- Check Network tab in DevTools for actual request URL

**Q: Anti-cheat events not showing**

- Open DevTools Network tab
- Look for requests to `/candidate/:link/event`
- If 404, backend endpoint not implemented

**Q: Tailwind styles not appearing**

- Restart dev server: `npm run dev`
- Check `tailwind.config.cjs` content paths include your file

---

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel --prod
```

### Build Docker Image

```bash
docker build -t skill-proof-client .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.your-domain.com skill-proof-client
```

---

## 📚 File Size Reference

After `npm run build`:

```
Page Routes:            ~5-15 KB each
Shared Chunks:          ~30-50 KB
Total JS (gzipped):     ~130-150 KB
```

Acceptable for modern browsers.

---

## ✅ Checklist Before Production

- [ ] Backend API endpoints implemented
- [ ] `.env.local` points to production backend
- [ ] HTTPS enabled
- [ ] Anti-cheat events are logged
- [ ] Form validation working (test each form)
- [ ] Candidate flow tested end-to-end
- [ ] HR dashboard shows real data
- [ ] PDF/DOCX file upload working
- [ ] Mobile responsive (test on phone)
- [ ] No errors in DevTools console

---

## 🆘 Support

**Issue not listed?** Check:

1. `SETUP.md` — Full setup guide
2. `ARCHITECTURE.md` — System design & flow
3. DevTools Console — Error messages
4. GitHub Issues (if using GitHub)

---

**Happy Building! 🚀**
