# ReelScheduler — Project Showcase Script

**Total Duration:** 90–120 seconds | **Best format:** Horizontal (16:9) or Vertical (9:16)

---

## Purpose

A concise project showcase script highlighting architecture, implementation choices, key technical challenges, and a short live demo of the working product. Good for portfolio videos, conference lightning talks, or product demos.

---

## SCRIPT OUTLINE

### 0:00–0:10 — Quick Intro & Hook
**Visual:** Your face + app logo, quick cut to Dashboard
**Tone:** Friendly, curious, slightly technical

**YOU SAY:**
> "Hi, I'm [Your Name]. I built ReelScheduler — a small platform to upload, organize, and publish video content automatically to YouTube, Instagram, and Facebook. In 90 seconds I'll show the architecture, a live demo, and a couple of technical lessons learned."

---

### 0:10–0:35 — Problem & Goals
**Visual:** Short montage of manual posting (tabs, re-uploads, calendar juggling)
**Tone:** Empathetic, problem-solver

**YOU SAY:**
> "Creators and small teams waste hours manually re-uploading the same video across platforms. The goal of ReelScheduler was simple: reduce repetitive work, centralize content, and let teams collaborate safely. Key goals: reliability, extendability, and low-latency uploads."

---

### 0:35–0:55 — Architecture Snapshot
**Visual:** Simple diagram overlay (Backend, Frontend, Cloudinary, YouTube OAuth, Agenda jobs)
**Tone:** Clear, slightly technical

**YOU SAY:**
> "Here’s the stack: React + Vite on the frontend, Node.js + Express backend, MongoDB for storage, Cloudinary for video hosting, and Agenda.js for background scheduling. We use Google OAuth for YouTube uploads and an Instagram/Facebook integration layer. Thumbnails are generated server-side with ffmpeg."

**VISUAL CUE:**
- Show icons for React, Node, MongoDB, Cloudinary, ffmpeg, Agenda
- Annotate the data flow: Upload → Cloudinary → Video record in MongoDB → Schedule job → Publish

---

### 0:55–1:25 — Live Demo (Upload → Bundle → Schedule)
**Visual:** Screen capture of the app (Upload, Bundle creation, Create Schedule)
**Tone:** Calm, demo-focused

**YOU SAY (voiceover while demo runs):**
> "Upload a video — it stores in Cloudinary and we generate a thumbnail using ffmpeg. Next, create a bundle to group videos for a campaign. Finally, create a schedule, pick platforms, set frequency, and save. Agenda creates a cron-style job that will publish automatically."

**ACTION (demo):**
- Drag & drop upload
- Show backend processing toast / thumbnail appear
- Create a bundle and attach the video
- Open CreateSchedule, choose platforms (YouTube, Instagram, Facebook), set daily frequency, save
- Show schedule appearing in Dashboard with "Next run" time

---

### 1:25–1:50 — Technical Challenges & Solutions
**Visual:** Bullet highlights, code snippets (optional), small diagrams
**Tone:** Honest, informative

**YOU SAY:**
> "A few challenges:
> 1) Reliable YouTube uploads — we built a token-refresh flow and background retry logic for intermittent failures.
> 2) Thumbnail generation at scale — using ffmpeg worker processes and Cloudinary optimizations prevented bottlenecks.
> 3) Accurate quota counting — edge cases in counting active schedules required a migration script to attach missing plan references in the DB.
>
> Lessons: design for idempotency in jobs, graceful fallbacks for missing data, and keep background processing isolated from request latency."

---

### 1:50–2:00 — Wrap & How to Try
**Visual:** Your face, repo link / prod site overlay
**Tone:** Inviting, professional

**YOU SAY:**
> "If you want to explore the code, the repo includes the backend, scripts, and frontend demo. Try the hosted demo (link in the description) or ping me for a walkthrough. Thanks for watching — happy to answer technical questions!"

---

## NOTES FOR RECORDING
- Keep this concise and confident — aim for 90–120 seconds.
- Use screen recording for the demo portion and narrate steps as you perform them.
- Add short code snippets or screenshots for the architecture and challenges sections.
- If sharing on LinkedIn, include a short post copy summarizing the technical highlights and a link to the repo.

---

## SUGGESTED POST COPY (technical/audience)
> "Built ReelScheduler — a tiny platform that centralizes video uploads, auto-generates thumbnails, and schedules multi-platform publishing. Stack: React, Node, MongoDB, Cloudinary, Agenda.js. Open to feedback and collaborators — repo link in comments. #buildinpublic #dev"

---

**End of script**
