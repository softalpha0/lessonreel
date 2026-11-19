# HACKATHON.md: master brief for Claude Code

> **Claude Code: read this whole file before doing anything.** It tells you what hackathon this is, what we're building, the rules we must follow, how to set up my computer, and how to back up and document the work. Then read [`DEVELOPMENT_PROTOCOL.md`](DEVELOPMENT_PROTOCOL.md) (how we build: one feature at a time, I test and approve each), [`BUILD_PLAN.md`](BUILD_PLAN.md) (the ordered stages), [`AGENTS.md`](AGENTS.md) and [`docs/README.md`](docs/README.md).

|              |                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------- |
| Hackathon    | **#BuildHybridAI 2026** (Google / Firebase, run on Devpost)                              |
| Project      | **Lessonreel**: turn lesson notes into a narrated explainer video, even with no internet |
| Builder      | Benjamin Ugochukwu, solo, **beginner**, on **Windows + PowerShell**                      |
| Deadline     | **Mon Nov 30 2026, 2:00 PM PT = 11:00 PM Lagos (WAT)**. Our target: **submit Nov 29**    |
| Last updated | 2026-11-19                                                                               |

---

## Contents

1. [How to work with me (read first)](#1-how-to-work-with-me-read-first)
2. [The hackathon](#2-the-hackathon)
3. [Rules we must follow](#3-rules-we-must-follow)
4. [Judging: how points are given](#4-judging-how-points-are-given)
5. [What we're building](#5-what-were-building)
6. [Technologies and official docs](#6-technologies-and-official-docs)
7. [Computer setup, one step at a time](#7-computer-setup-one-step-at-a-time)
8. [Firebase project setup](#8-firebase-project-setup)
9. [MANDATORY: GitHub backup, version control, security and README](#9-mandatory-github-backup-version-control-security-and-readme)
10. [Build plan and daily routine](#10-build-plan-and-daily-routine)
11. [Submission checklist](#11-submission-checklist)
12. [Where to get help](#12-where-to-get-help)
13. [Starter prompt to paste into Claude Code](#13-starter-prompt-to-paste-into-claude-code)

---

## 1. How to work with me (read first)

I'm a beginner. Please:

1. **Go one step at a time.** Do one thing, show me the result, confirm it worked, then move on.
2. **Explain in plain language** what each command does and why, before running it. One or two sentences is enough.
3. **Check before installing.** Run the "check" command first. If it's already installed and the version is fine, say so and skip it.
4. **Confirm it works** with the "verify" command after every install or change. If it fails, stop and help me fix it before continuing.
5. **Use PowerShell commands** (Windows). Don't give me bash-only commands.
6. **Never overwrite** an existing repo, remote, file or setting without asking me first.
7. **Never print or commit secrets** (keys, tokens, passwords).
8. **Follow the hackathon rules** in §3 and the build docs in `docs/`. If something I ask would break a rule, tell me.
9. **Keep it simple.** Don't add libraries, files or features that aren't in the plan unless I agree.
10. **Back up as we go** (§9). A commit isn't a backup until it's pushed to GitHub.

---

## 2. The hackathon

| Item                | Detail                                                                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                | #BuildHybridAI 2026                                                                                                                                                                          |
| What it's about     | Build apps that use **both on-device and cloud AI** with **Firebase AI Logic**. The app runs prompts on the device when a local model is available and falls back to the cloud when it isn't |
| Sponsor / organizer | Google LLC (Firebase team). Administered by Devpost, Inc.                                                                                                                                    |
| Format              | Online, public. Solo, teams and organizations allowed                                                                                                                                        |
| Main page           | https://firebasehybridaihackathon.devpost.com/                                                                                                                                               |
| Rules               | https://firebasehybridaihackathon.devpost.com/rules                                                                                                                                          |
| Resources           | https://firebasehybridaihackathon.devpost.com/resources                                                                                                                                      |
| Judge listed        | Ankita Saxena                                                                                                                                                                                |
| Sponsor tracks      | None. Only Google/Firebase                                                                                                                                                                   |

### Timeline (Lagos time = WAT, UTC+1)

| Event                                 | Official               | Lagos                               |
| ------------------------------------- | ---------------------- | ----------------------------------- |
| Submissions open                      | Nov 11, 1:30 PM PT     | Nov 11, 10:30 PM                    |
| Build session (recorded)              | Nov 12, 10:00 AM PT    | Watch: https://youtu.be/lEsZMYkftiU |
| Quota account Sprint 3 (last request) | Nov 25, 10:00 AM PT    | Nov 25, 7:00 PM                     |
| **Submission deadline**               | **Nov 30, 2:00 PM PT** | **Nov 30, 11:00 PM**                |
| Judging                               | Dec 10–16              | Dec 10–16                           |
| Winners announced                     | ~Dec 21, 12:00 PM PT   | ~Dec 21, 9:00 PM                    |

### Prizes ($30,000 total)

| Prize                   | Amount                                                  |
| ----------------------- | ------------------------------------------------------- |
| Grand Prize             | $10,000 + interview, featured blog post, social mention |
| 1st Runner Up           | $7,000 + featured blog post, social mention             |
| 2nd Runner Up           | $4,000 + social mention                                 |
| Best iOS App            | $3,000                                                  |
| Best Android App        | $3,000                                                  |
| **Best Web/Chrome App** | **$3,000** ← our category                               |

A project can win one top prize **and** one "Best of" prize. Apps on more than one platform get "strong consideration" for the Grand Prize.

### Optional Google Quota Account (extra paid-model credits)

Only needed if the free tier isn't enough (for example image generation). Steps: register on Devpost → submit the [Quota Account form](https://forms.gle/uPcDhaYW3iVo2AYw5) → eligibility check → ID + selfie verification → approval email → account arrives Thursday (Sprint 3: Fri Nov 27) → sign in using an **incognito window**, create a project, add Firebase. Each account lasts 4 days. You pay for anything beyond the quota.

---

## 3. Rules we must follow

From the official rules. **Breaking any of these can disqualify us.**

### Must do

- [ ] Build a **Gen AI app with Firebase AI Logic**, imported and **called at runtime** (not just mentioned in the README).
- [ ] Target at least one platform. Ours: **Web (Chrome) with Gemini Nano 4** via Firebase AI Logic.
- [ ] Turn on **App Check** (required by Firebase AI Logic). Debug tokens are accepted for judging.
- [ ] App must **install and run consistently** and match the video and description.
- [ ] Project is **newly created during the submission period** (we started Nov 18). Don't copy code from my other projects (including Inkcut). Standard tools, libraries, templates and **AI coding assistants are allowed**.
- [ ] Provide a **summary of what was built during the submission period**.
- [ ] Support **English**. All materials in English.
- [ ] Keep it **free** for users and judges, and **working until the end of judging (Dec 16)**.

### Must submit

- [ ] **Text description:** how we used Firebase AI Logic, features, value proposition.
- [ ] **Public GitHub repo** with an **open-source license visible in the About section** (Apache-2.0 preferred; we use it). Must contain all source, assets and setup instructions.
- [ ] **Demo video:** max **3 minutes** (only the first 3 are judged), **public on YouTube**, English or English subtitles, showing the app working.
- [ ] **Hosted URL:** not required but **strongly encouraged** (we'll use Firebase Hosting).
- [ ] **Testing access** for judges until Dec 16 (no login needed in our app).

### Must not do

- No production API keys, live Google Cloud secrets, confidential data or personal data in the repo, form or testing notes.
- No third-party ads, logos or trademarks that suggest sponsorship.
- No content that infringes others' rights or is offensive.
- **No commits after the deadline**: they won't be evaluated.
- Don't make the project depend on financial or preferential support from Google or Devpost.

### Unclear: asked or to ask in Discord

1. Team size limits / changing members (rules don't say; we're solo).
2. Will judges test the on-device path, or is the video enough if they have no Nano?

---

## 4. Judging: how points are given

**Stage 1 (pass/fail):** has all required parts, fits the challenge, uses the required tech.

**Stage 2 (scored):** four criteria, **equal weight**, each 1–5, averaged. Judges may use experts, peer review **and automated AI analysis**, so the README and description must be very clear.

| #   | Criterion                        | What it means for us                                                                                               |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | **Technological implementation** | Clean build; hybrid inference used well (on-device storyboard, cloud voice/images, offline queue). First tie-break |
| 2   | **Design**                       | A complete product, not a proof of concept: every screen and error state handled                                   |
| 3   | **Potential impact**             | Specific real problem and audience: teachers with unreliable internet/power                                        |
| 4   | **Quality of the idea**          | Creative, non-obvious use of Firebase AI Logic; show we understand the problem                                     |

---

## 5. What we're building

**Lessonreel:** a teacher pastes lesson notes. **Gemini Nano on the device** writes the script, scenes, image ideas and a 3-question quiz, **even with no internet**. Voice and images need the cloud, so they **wait in a queue** and run on their own when the connection returns. The teacher previews and downloads one video, narrated in English plus French, Spanish, Hindi or Swahili.

| Step                      | Runs where                              | Firebase AI Logic mode |
| ------------------------- | --------------------------------------- | ---------------------- |
| Notes → storyboard + quiz | On-device (Gemini Nano), cloud fallback | `PREFER_ON_DEVICE`     |
| Translate narration       | Cloud                                   | `ONLY_IN_CLOUD`        |
| Voiceover (TTS)           | Cloud                                   | `ONLY_IN_CLOUD`        |
| Scene images              | Cloud                                   | `ONLY_IN_CLOUD`        |
| Offline queue             | Firestore (offline cache)               | n/a                    |
| Video export              | Browser (canvas + MediaRecorder)        | n/a                    |

**Full product docs** (read the one you need, they share IDs):

| Doc                                                                  | Covers                                                          |
| -------------------------------------------------------------------- | --------------------------------------------------------------- |
| [docs/README.md](docs/README.md)                                     | Index, shared IDs, **docs-vs-code gap table = build checklist** |
| [docs/01-product-requirements.md](docs/01-product-requirements.md)   | Problem, users, goals, scope, release plan                      |
| [docs/02-ux-design.md](docs/02-ux-design.md)                         | Personas, journeys, user flows, screens, error flows            |
| [docs/03-screen-design.md](docs/03-screen-design.md)                 | Wireframes, colours, fonts, components, accessibility           |
| [docs/04-functional-spec.md](docs/04-functional-spec.md)             | Requirements, business rules, errors, **acceptance criteria**   |
| [docs/05-data-flow.md](docs/05-data-flow.md)                         | Where data comes from, goes, and is stored                      |
| [docs/06-software-architecture.md](docs/06-software-architecture.md) | Components, tech choices, security, ADRs                        |
| [AGENTS.md](AGENTS.md)                                               | Coding rules, verified SDK facts, status log                    |

---

## 6. Technologies and official docs

### What we use and why

| Technology                           | What it is (plain language)                    | Why we need it                                                |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------- |
| **Git**                              | Tracks every change to the code on my computer | Undo mistakes; required to use GitHub                         |
| **GitHub**                           | Stores the code online                         | Backup + the hackathon requires a public repo                 |
| **Node.js** (v20+, we use 22 LTS)    | Runs JavaScript tools on my computer           | Needed by every build tool below                              |
| **pnpm** (v10)                       | Installs code libraries (faster npm)           | Our repo is a pnpm "workspace" (several packages in one repo) |
| **TypeScript**                       | JavaScript with type checking                  | Catches mistakes before running                               |
| **Vite**                             | Dev server + bundler                           | Runs the app at `localhost:5173` and builds it for hosting    |
| **Firebase**                         | Google's app platform                          | Hosting, login, database, App Check, AI Logic                 |
| **Firebase CLI** (`firebase-tools`)  | Command-line tool for Firebase                 | Log in and deploy the app                                     |
| **Firebase AI Logic**                | SDK to call Gemini from the app safely         | The required hackathon tech; does on-device + cloud           |
| **Gemini Nano 4**                    | Small AI model built into Chrome               | Runs the storyboard offline                                   |
| **Gemini cloud models**              | Big AI models in Google's cloud                | Fallback text, translation, voice, images                     |
| **App Check + reCAPTCHA Enterprise** | Proves calls come from our real app            | Required; stops abuse of our AI quota                         |
| **Anonymous Auth**                   | Gives each browser an ID with no sign-up       | So each user only sees their own data                         |
| **Cloud Firestore**                  | Database that also works offline               | Stores the queue of voice/image jobs                          |
| **IndexedDB** (`idb-keyval`)         | Storage inside the browser                     | Keeps audio and images on the device                          |
| **Zod**                              | Checks data has the right shape                | Makes sure AI output is valid                                 |
| **Vitest / ESLint / Prettier**       | Tests / code checker / formatter               | Quality; run by `pnpm run ci`                                 |
| **GitHub Actions**                   | Runs our checks online on every push           | CI badge, catches broken builds                               |
| **Google Chrome 139+** (desktop)     | Browser with Gemini Nano                       | Needed to test on-device AI                                   |

### Current model names (checked 2026-11-19)

Set in `apps/web/.env.local`:

| Use                   | Model                                | Note                                                                                 |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| Cloud text / fallback | `gemini-3.5-flash-lite`              |                                                                                      |
| Voice (TTS)           | `gemini-3.8-flash-tts`               | ⚠️ `gemini-3.1-flash-tts-preview` (on the Resources page) **shut down Nov 17, 2026** |
| Images                | _check docs, set `VITE_IMAGE_MODEL`_ | Optional; images skipped if empty                                                    |

TTS languages we offer: English, French, Spanish, Hindi (stable), Swahili (preview). **Yoruba, Igbo, Hausa, Pidgin are not supported** by Gemini TTS.

### Official docs (Claude Code: check these before writing Firebase code)

| Topic                                                            | Link                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Firebase AI Logic overview                                       | https://firebase.google.com/products/firebase-ai-logic                    |
| Hybrid inference: how it works                                   | https://firebase.blog/posts/2025/10/understand-ai-logic-hybrid-inference/ |
| Hybrid docs (setup + fallback)                                   | https://firebase.google.com/docs/ai-logic/hybrid                          |
| **Hybrid on Web: get started**                                   | https://firebase.google.com/docs/ai-logic/hybrid/web/get-started          |
| Hybrid prompting in Chrome                                       | https://developer.chrome.com/docs/ai/firebase-ai-logic                    |
| Generate speech (TTS)                                            | https://firebase.google.com/docs/ai-logic/generate-speech                 |
| Production checklist (App Check, Remote Config, Firestore, Auth) | https://firebase.google.com/docs/ai-logic/production-checklist            |
| Firebase Agent Skills (for Claude Code)                          | https://firebase.google.com/docs/ai-assistance/agent-skills               |
| Gemini Nano on Android (for later)                               | https://developers.google.com/ml-kit/genai/prompt/android/get-started     |
| Gemini TTS languages                                             | https://docs.cloud.google.com/text-to-speech/docs/gemini-tts              |
| Firebase community                                               | https://firebase.google.com/community                                     |

### Verified facts about the SDK (firebase 13.4.0, checked 2026-11-18)

- `getGenerativeModel(ai, { mode, onDeviceParams, inCloudParams })`; modes `PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`.
- `response.inferenceSource` is `"on_device"` or `"in_cloud"`. We show it as a badge.
- `model.initializeDeviceModel(onProgress)` downloads Nano and **must be triggered by a click**.
- On-device limits: single-turn text/images, ~9,216 tokens, no tools, no audio or image output.
- Users need Chrome desktop 139+ with `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` enabled and enough disk/GPU.

---

## 7. Computer setup, one step at a time

**Claude Code: do these in order.** For each step: explain it in one or two sentences, run **Check**, install only if missing or too old, then run **Verify** and show me the result. Don't continue until it passes.

> If PowerShell says "running scripts is disabled" for `pnpm` or `firebase`, run this once (it allows scripts you installed yourself), then retry:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

| #   | Tool                                     | Check                                                              | Install (only if needed)                                                                                      | Verify                                                                                  | Pass when                                                                         |
| --- | ---------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **winget** (Windows installer)           | `winget --version`                                                 | Comes with Windows 10/11 ("App Installer" in Microsoft Store)                                                 | `winget --version`                                                                      | Prints a version                                                                  |
| 2   | **Git**                                  | `git --version`                                                    | `winget install --id Git.Git -e` then **reopen PowerShell**                                                   | `git --version`                                                                         | 2.40 or newer                                                                     |
| 3   | **Git identity**                         | `git config --global user.name` and `user.email`                   | `git config --global user.name "Benjamin Ugochukwu"` and `git config --global user.email "<my GitHub email>"` | same as check                                                                           | Both print my details                                                             |
| 4   | **Node.js LTS**                          | `node --version`                                                   | `winget install OpenJS.NodeJS.LTS` then reopen PowerShell                                                     | `node --version` and `npm --version`                                                    | Node v20+ (v22 preferred)                                                         |
| 5   | **pnpm**                                 | `pnpm --version`                                                   | `npm install -g pnpm@10`                                                                                      | `pnpm --version`                                                                        | 10.x                                                                              |
| 6   | **GitHub CLI** (makes GitHub login easy) | `gh --version`                                                     | `winget install --id GitHub.cli -e` then reopen PowerShell                                                    | `gh auth status` after `gh auth login` (choose GitHub.com → HTTPS → login with browser) | "Logged in to github.com"                                                         |
| 7   | **Firebase CLI**                         | `firebase --version`                                               | `npm install -g firebase-tools`                                                                               | `firebase login` then `firebase projects:list`                                          | My projects list shows                                                            |
| 8   | **Google Chrome**                        | Open `chrome://version`                                            | Install/update from google.com/chrome                                                                         | `chrome://version`                                                                      | 139 or newer                                                                      |
| 9   | **Gemini Nano flag**                     | Open `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` | Set to **Enabled**, click Relaunch                                                                            | In DevTools console: `await LanguageModel.availability()`                               | Not `"unavailable"` (`"downloadable"`, `"downloading"` or `"available"` are fine) |
| 10  | **Code editor** (optional)               | Is VS Code installed?                                              | `winget install --id Microsoft.VisualStudioCode -e`                                                           | `code --version`                                                                        | Prints a version                                                                  |

### Then set up the project itself

| #   | Step                                                                           | Command (run in the project folder)                     | Verify                                                                                    |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 11  | Unzip `lessonreel.zip` into e.g. `C:\dev\lessonreel` and open PowerShell there | `cd C:\dev\lessonreel`                                  | `git log --oneline` shows the existing commits                                            |
| 12  | Install libraries                                                              | `pnpm install`                                          | Finishes without errors                                                                   |
| 13  | Run all checks                                                                 | `pnpm run ci`                                           | Lint, format, typecheck, **13 tests passing**, build OK                                   |
| 14  | Create my local settings file                                                  | `Copy-Item apps\web\.env.example apps\web\.env.local`   | File exists; it's ignored by Git (`git check-ignore apps\web\.env.local` prints the path) |
| 15  | Fill `.env.local`                                                              | After §8. Never paste its contents into chat or commits | n/a                                                                                       |
| 16  | Start the app                                                                  | `pnpm dev`                                              | http://localhost:5173 opens                                                               |

---

## 8. Firebase project setup

**Claude Code: guide me through the console one screen at a time.** Console: https://console.firebase.google.com

1. **Create project** → name `lessonreel` → Google Analytics optional (off is fine).
2. **Add a Web app** (the `</>` icon) → nickname `lessonreel-web` → also set up Firebase Hosting → copy the config values into `apps/web/.env.local` (`VITE_FIREBASE_*`). These are public identifiers, not secrets, but keep the file out of Git anyway.
3. **Firebase AI Logic** → Get started → choose **Gemini Developer API** (free tier).
4. **App Check** → register the web app with **reCAPTCHA Enterprise** → put the site key in `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.
   - For local dev keep `VITE_APPCHECK_DEBUG=true`, load the app, copy the **debug token** from the browser console, add it under App Check → Apps → Manage debug tokens. **Never commit the token.**
   - Turn on **enforcement** for Firebase AI Logic once it works.
5. **Authentication** → Sign-in method → enable **Anonymous**.
6. **Firestore** → Create database (production mode, nearest region) → deploy our rules: `firebase use --add` (pick the project) then `firebase deploy --only firestore:rules`.
7. **Test:** `pnpm dev`, paste notes, click **Make storyboard**. Verify the storyboard appears with a badge.
8. **Deploy:** `pnpm build` then `firebase deploy --only hosting`. Verify the `*.web.app` link works in an incognito window.

---

## 9. MANDATORY: GitHub backup, version control, security and README

These rules apply from the first hour until submission. They're part of development, not optional final tasks.

### 9.1 Git and GitHub setup

- Check Git is installed (§7 step 2) and whether this folder is already a Git repo (`git status`). **It already is**: the zip includes the history.
- **Fix the commit author before the first push.** The existing commits use a placeholder email. After setting my identity (§7 step 3), rewrite the authors (safe because nothing is pushed yet):
  `git rebase -r --root --exec "git commit --amend --no-edit --reset-author"`
  Verify: `git log --format="%an <%ae>"` shows my name and email on every commit.
- Check for an existing remote first: `git remote -v`. **Never overwrite an existing remote without asking me.**
- Create the GitHub repo and connect it (private for now is fine; it must be **public before submitting**):
  `gh repo create lessonreel --private --source . --remote origin --push`
- Verify: `git status` says "up to date with 'origin/main'", and the repo shows on github.com.
- Replace `OWNER` in the README's CI badge with my GitHub username.
- Explain every command in beginner-friendly language.

### 9.2 When to save (commit + push)

| When                          | What to do                                                      |
| ----------------------------- | --------------------------------------------------------------- |
| First hour                    | Initialize Git (done) and create the first online backup (push) |
| After project setup           | Commit and push                                                 |
| After a major feature         | Commit and push                                                 |
| After fixing an important bug | Commit and push                                                 |
| Before major changes          | Create a checkpoint commit (or a branch) first                  |
| End of each working session   | Commit and push                                                 |

**Good messages:** `Add per-scene job progress`, `Fix French narration translation`, `Improve mobile layout of lesson form`, `Add sample notes button`.
**Never:** `update`, `changes`, `fix stuff`, `final`, `final final`.

**A commit is not an online backup until `git push` succeeds.** Always verify the push and never claim a backup exists online without checking.

### 9.3 Keep secrets out of GitHub

Our `.gitignore` already ignores `.env`, `.env.*` (except `.env.example`), `node_modules/`, `dist/`, `build/`, logs and OS files. Keep it that way.

**Never commit:** `.env` / `.env.local` with real values, API keys, database passwords, private keys, **wallet seed phrases**, auth tokens, the **App Check debug token**, or anyone's personal data.

**Before every push:**

1. `git status` and `git diff --staged`: look at what's about to go up.
2. Make sure no `.env*` file (other than `.env.example`) is staged.
3. `git check-ignore apps\web\.env.local` must print the path.
4. Don't print real credentials in the terminal, docs or chat.

**If a secret is pushed by accident:** stop, tell me, **revoke or rotate it immediately** (deleting it in a new commit is not enough; it's still in history), then clean the history (e.g. `git filter-repo`) and force-push only after I agree.

### 9.4 README.md

- A first version already exists (name, problem, what it does, how it works, features, stack, structure, setup, env vars, run, test). Keep **one** README and **update it** whenever:
  - a major feature lands,
  - the tech stack changes,
  - setup or run steps change,
  - what the app does changes, or
  - new requirements affect how it runs.
- Don't generate extra documentation files unless I ask. (The `docs/` set already exists by my request; update those instead of creating new ones.)
- Also keep the **Build log** section and the gap table in `docs/README.md` current.

### 9.5 Final verification (before submitting)

- [ ] `git status` clean, `git log origin/main..main` empty (everything pushed)
- [ ] GitHub repo is **public**, license shows in **About**
- [ ] No secrets in the repo (`git grep -i -E "apikey|secret|token|BEGIN PRIVATE"` reviewed)
- [ ] README matches the finished app; a new developer can follow it in a fresh folder
- [ ] CI badge is green

### Golden rules

1. Back up before major work.
2. Commit after meaningful progress.
3. Push regularly to GitHub.
4. Use descriptive commit messages.
5. Never expose secrets.
6. README exists from the first hour.
7. Update the same README as you build.
8. Verify every backup.

---

## 10. Build plan and daily routine

### Plan to the deadline (from [01 §10](docs/01-product-requirements.md#10-release-plan))

| Date      | Goal                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------- |
| Nov 19–20 | Setup (§7–§8), push to GitHub, test Nano storyboard on 5 real lesson notes, talk to 3 teachers           |
| Nov 21–22 | Queue + voice + images end to end; Nano status on load; sample notes; per-scene progress                 |
| Nov 23–24 | Export tested in real Chrome; edit scene; quiz panel; mobile fixes; error messages                       |
| Nov 25    | Quota Sprint 3 request if needed (before 7:00 PM Lagos)                                                  |
| Nov 26    | **Feature freeze**                                                                                       |
| Nov 27–28 | Polish, evidence screenshots, README, record demo video (see [docs/demo-script.md](docs/demo-script.md)) |
| Nov 29    | **Submit on Devpost**                                                                                    |

**Build order:** riskiest first. (1) Nano gives valid storyboard JSON, (2) TTS model and languages work, (3) video export in real Chrome.

### Every working session

1. `git pull`, then `pnpm install` if `package.json` changed.
2. Pick the next stage in [`BUILD_PLAN.md`](BUILD_PLAN.md).
3. Follow [`DEVELOPMENT_PROTOCOL.md`](DEVELOPMENT_PROTOCOL.md): explain → build **one feature** → technical checks → my testing guide → **wait for my approval**.
4. Test it like a user (and offline, if it touches offline behaviour).
5. `pnpm run ci` must pass.
6. After I approve: update `FEATURE_GUIDE.md`, then commit with a clear message and **push**. Verify the push.
7. Update `BUILD_PLAN.md` status, the README, the docs gap table and `AGENTS.md` Status if something changed.
8. Something broken? Fill in the report in [`DEBUGGING.md`](DEBUGGING.md) Part 1 and paste it to Claude Code.
9. Stuck for 30 minutes? Change approach, ask in Discord, or cut the feature.

---

## 11. Submission checklist

**Devpost form**

- [ ] Title, tagline, description that **starts with the problem in plain words**: what problem, who has it, does it work, why it's different, would someone use it
- [ ] How we used Firebase AI Logic (on-device storyboard, cloud TTS/images, offline queue, App Check)
- [ ] Summary of what was built during the submission period (all of it, started Nov 18)
- [ ] Public GitHub URL (Apache-2.0 in About)
- [ ] YouTube demo ≤ 3:00, public, English, captions on
- [ ] Hosted URL (free, no login, works until Dec 16)
- [ ] Testing instructions for judges (Chrome version, Nano flag optional, cloud works without it). Include an App Check debug token only through the private testing field if needed, never in the repo
- [ ] Category: Web/Chrome selected

**Before pressing submit**

- [ ] Open every link in an incognito window and on my phone
- [ ] Score the project against the 4 criteria (§4) and fix the weakest one
- [ ] §9.5 final verification done
- [ ] Submitted by **Nov 29** (edits are usually allowed until the deadline)

---

## 12. Where to get help

| Need                       | Where                                                       |
| -------------------------- | ----------------------------------------------------------- |
| Hackathon questions        | Discord → `#hackathon-help`, use the **#BuildHybridAI** tag |
| Quota account issues       | Same Discord                                                |
| Firebase product questions | https://groups.google.com/g/firebase-talk                   |
| General Firebase support   | https://firebase.google.com/community                       |

---

## 13. Starter prompt to paste into Claude Code

Open PowerShell in the project folder, run `claude`, then paste:

```
I'm a beginner preparing for the #BuildHybridAI 2026 hackathon. I want to build Lessonreel.
Read HACKATHON.md fully, then DEVELOPMENT_PROTOCOL.md, BUILD_PLAN.md, AGENTS.md and docs/README.md.

We follow DEVELOPMENT_PROTOCOL.md: one feature at a time, and you stop after each one
so I can test it myself and approve it before you commit, push and move on.

Start with BUILD_PLAN.md Stage 0: check what's already installed on my computer, then install
anything else this project needs (HACKATHON.md section 7). Go one step at a time, explain each
step in plain language, and confirm it works before moving on. Then do section 9.1 (fix commit
authors, create the GitHub repo, push and verify) and guide me through section 8 (Firebase setup)
one screen at a time. Stop at the end of Stage 0 and give me my testing guide.
```
