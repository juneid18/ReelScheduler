# ReelScheduler — Project Showcase Script

Purpose: a concise, repeatable demo + speaker script to showcase ReelScheduler to stakeholders, investors, or teammates.

---

**Elevator pitch (10–15s)**
- "ReelScheduler is a lightweight scheduling and publishing platform for short-form videos that automates uploads, thumbnails, and posting schedules across social channels — with fast Cloudinary-backed storage, server-side thumbnail generation, and an easy-to-use scheduling UI."

**Intro (30s)**
- "Hi, I’m [Your Name]. Today I’ll show how ReelScheduler helps content creators plan, upload, and publish short video content efficiently. We’ll walk through the core features, the architecture, and a live demo showing upload → thumbnail → scheduling → publish."

**Key features (30s)**
- Upload video files (drag & drop or direct upload).
- Automatic thumbnail generation (server-side via ffmpeg).
- Cloudinary storage for reliable, CDN-backed asset hosting.
- Schedule videos for future posting with metadata and platform targets.
- Download / delete / metadata management APIs and analytics overview.

**Architecture overview (60s)**
- Backend: Node.js + Express, MongoDB (Mongoose models), background job scheduler for posting.
- Storage: Cloudinary for media files and thumbnails (`utils/cloudinaryStorage.js`).
- Video processing: `ffmpeg` (via `fluent-ffmpeg` + `ffmpeg-static`) for thumbnail generation.
- Frontend: Vite + React components for the scheduling UI.
- Deployment notes: PM2 or a process manager for production; env vars configured for Cloudinary keys.

---

## Live demo script (3–6 minutes)

Before the demo: ensure Cloudinary env variables are set (Windows PowerShell):

```powershell
$env:CLOUDINARY_CLOUD_NAME = "<your_cloud_name>"
$env:CLOUDINARY_API_KEY = "<your_api_key>"
$env:CLOUDINARY_API_SECRET = "<your_api_secret>"
```

Start backend (PowerShell):

```powershell
cd Backend
npm install        # only if dependencies not installed
npm run dev        # or `node index.js` / your dev script
```

Start frontend (PowerShell) in a new terminal:

```powershell
cd frontend
npm install
npm run dev
# open the app URL printed by Vite in browser (usually http://localhost:5173)
```

Demo steps (walk through each action, narrate the purpose):

1. Upload a video
   - In the UI, navigate to the Upload screen.
   - Drag and drop a sample MP4 or use the file selector.
   - Narration: "The file is uploaded to the server, processed to generate a thumbnail, and stored in Cloudinary."
   - Verify in backend logs: "File uploaded successfully to Cloudinary: reel-scheduler/<public_id>"

2. Thumbnail generation
   - After upload completes, open the video detail dialog.
   - Show the generated thumbnail preview. Explain `ffmpeg` usage and that the server cleaned up temp files after upload.

3. Create scheduling metadata
   - Enter title, caption, target platform(s), and pick a future publish time.
   - Save schedule and show it appearing in the schedules list.

4. Run scheduled job (optional manual trigger)
   - If you want to simulate immediate publishing, either set the scheduled time a minute ahead, or manually trigger the scheduled task via a debug endpoint (example):

```powershell
# Example: trigger scheduler endpoint (adjust host/port)
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/schedules/trigger-now -Body @{}
```

   - Narration: "The background job fetches the video from Cloudinary and sends it to the publishing target."

5. Download / delete
   - Demonstrate the Download link which serves content from Cloudinary.
   - Delete the file and show the record removed and the Cloudinary file deletion log (if enabled).

6. Analytics / logs
   - Open the analytics screen to show basic stats of scheduled posts and successful uploads.

---

## Speaker notes & talking points

- Migration highlight: we migrated from Appwrite storage to Cloudinary for robust CDN, preview URLs, and transformations. DB fields remain compatible for a zero-downtime migration.
- Reliability: Show how Cloudinary plus server-side processing ensures optimized thumbnail generation and CDN delivery.
- Scalability: background job system can scale independently; media storage is offloaded to Cloudinary.
- Security: show how API requires authentication and how uploads only accept validated users.

---

## Suggested slide outline (6–8 slides)

1. Title + Elevator pitch
2. Problem & Opportunity (pain points for creators)
3. Solution: ReelScheduler feature highlights
4. Architecture diagram (backend, Cloudinary, frontend)
5. Live demo placeholder
6. Migration & technical highlights (Cloudinary, ffmpeg, scheduling)
7. Roadmap & next steps
8. Q&A

For slide speaker notes, use the speaker notes from the "Live demo script" section.

---

## Troubleshooting quick checklist (before presenting)

- Ensure Cloudinary env vars are set and valid.
- Run `npm install` in `Backend` and `frontend` if dependencies are missing.
- Confirm MongoDB is running and `process.env.MONGODB_URI` is set.
- Test a quick upload using `Backend/test-upload-simple.js` or via Postman to confirm server-side flows.

Example quick upload test (PowerShell):

```powershell
# Using curl on Windows (or use Postman)
curl -X POST "http://localhost:8000/api/videos/direct-upload" -H "Authorization: Bearer <token>" -F "file=@C:\path\to\sample.mp4"
```

---

## Closing / Call to action (15–20s)
- "ReelScheduler reduces the friction of planning and publishing short-form video content by automating media storage, thumbnail generation, and scheduled posting. I’d love feedback on which integrations or analytics you'd like next — should we add direct Instagram/TikTok posting or richer creator analytics?"

---

If you want, I can also:
- Create a short slide deck (PowerPoint / Google Slides) based on the slide outline above.
- Produce a shorter 90–120s demo script for quick investor pitches.
- Create a script that records a terminal demo (ffmpeg+asciinema instructions) or a step-by-step checklist for a recorded video.

Tell me which of these you'd like next and I’ll generate it.