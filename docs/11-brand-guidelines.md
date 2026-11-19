# 11 · Brand guidelines

|              |                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated | 2026-11-19                                                                                                                                      |
| Status       | **Proposed direction, approved by Benjamin 2026-11-19** (Direction A "Classroom notebook")                                                      |
| Owner        | Brand Strategist + Visual Identity Designer                                                                                                     |
| Feeds        | [12 Design system](12-design-system.md) · [13 UX writing](13-ux-writing.md) · [10 Demo plan](10-demo-plan.md) · Index: [docs/README](README.md) |

Lessonreel is new (started 2026-11-18). There is **no existing logo or brand history**; everything here is a proposed identity with reasons.

## 1. Brand foundation

| Element           | Definition                                                                                                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name              | **Lessonreel**: "lesson" (what teachers already have) + "reel" (a short video). One word, capital L only                                                                                                                                              |
| Purpose           | Help teachers turn the notes they already have into a short video their class will understand, without needing internet, money or editing skills                                                                                                      |
| Mission           | Make lesson videos possible for teachers who are left out by tools that assume fast, constant internet                                                                                                                                                |
| Vision            | Any teacher, anywhere, can prepare tomorrow's lesson video tonight, even during a power cut                                                                                                                                                           |
| Positioning       | For teachers with unreliable power or data, Lessonreel is the lesson-video maker that **does the hard part offline** and finishes the rest when the connection returns. Unlike cloud-only video tools, it never loses your work when the signal drops |
| Value proposition | Notes in → narrated video + quiz out. Free. No account. Works offline where it matters                                                                                                                                                                |
| Differentiation   | Offline-first planning on the device; honest badges showing where AI ran; built for low-connectivity classrooms rather than content creators                                                                                                          |

### Personality

| Lessonreel is…                                       | …not                    |
| ---------------------------------------------------- | ----------------------- |
| **Calm**: offline is normal, nothing to panic about  | Alarming, red-alert     |
| **Practical**: gets a teacher from notes to video    | Flashy, "AI magic"      |
| **Encouraging**: like a helpful colleague            | Patronising or childish |
| **Honest**: says where things run and what's waiting | Vague, over-promising   |
| **Warm**: paper, ink, classroom green                | Cold tech-dashboard     |

## 2. Brand voice and communication

Voice = a **patient, competent colleague in the staff room**. Plain words, short sentences, concrete next steps. This matches Benjamin's preference for authentic, non-AI-sounding writing.

### Writing principles

1. Say what happened and what to do next, in that order.
2. Name the real action ("Make storyboard", not "Continue").
3. Talk to one teacher ("your notes"), not to "users".
4. Offline is a state, not an error: "waiting for internet", never "failed".
5. No exclamation marks in errors. At most one in a success message.
6. Prefer everyday words over technical ones; keep technical terms only where judges or developers need them (e.g. "On-device").

### Words to use / avoid

| Use                                                | Avoid                                                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| lesson, notes, scene, narration, quiz, video       | content, asset, payload, artifact                                                                   |
| on this device, in the cloud, waiting for internet | edge inference, pending sync, offline error                                                         |
| make, write, add, download, try again              | unleash, empower, revolutionise, seamless, supercharge, magic, game-changer, cutting-edge, leverage |
| "This device can't run Gemini Nano offline."       | "Oops! Something went wrong 😢"                                                                     |
| "Voice and images are waiting for internet."       | "3 jobs pending in queue"                                                                           |

### Example messaging

- **Tagline (primary):** "Lesson notes to explainer video, even with no internet."
- **Short:** "Your notes. A video. No signal needed."
- **Product line on the page:** "Paste your notes. Lessonreel writes the storyboard on this device and finishes voice and pictures when you're back online."
- **Devpost / demo:** see [10 §9](10-demo-plan.md#9-devpost-description-draft).

Full in-app wording: [13 UX writing](13-ux-writing.md).

## 3. Visual identity

### Concept: "Classroom notebook"

Warm paper, dark ink, chalkboard green. Quiet surfaces so the teacher's lesson is the most colourful thing on screen. Status colours (green, blue, amber) carry meaning, not decoration.

### Logo (proposed)

| Part         | Spec                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Mark**     | A notebook page (rounded rectangle, folded top-right corner) with a **play triangle** in the middle. Says "lesson + video" at a glance |
| **Wordmark** | "Lessonreel" in Atkinson Hyperlegible Bold, ink `#1d1b16`                                                                              |
| **Lock-up**  | Mark left of wordmark, gap = ½ mark width; mark height = cap height × 1.4                                                              |
| Colours      | Mark: page in chalkboard green `#2f6f4f`, triangle and fold in paper `#faf7f0`                                                         |
| Minimum size | Mark 16 px (favicon); lock-up 96 px wide                                                                                               |
| Clear space  | Half the mark's width on all sides                                                                                                     |

Proposed SVG mark (for `apps/web/public/icon.svg`; refine during the build):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Lessonreel">
  <path d="M12 6h30l10 10v38a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="#2f6f4f"/>
  <path d="M42 6v10h10z" fill="#faf7f0" opacity=".6"/>
  <path d="M26 24v20l16-10z" fill="#faf7f0"/>
</svg>
```

Variations: full colour (default) · ink on paper (single colour) · paper on green (reversed, e.g. app icon background).

**Don't:** stretch, rotate, add gradients or shadows, recolour outside the palette, put the mark on busy images, or use a film-strip clipart instead.

### Colour identity

| Role                                           | Colour           | Hex       |
| ---------------------------------------------- | ---------------- | --------- |
| Paper (background)                             | warm off-white   | `#faf7f0` |
| Ink (text)                                     | near-black brown | `#1d1b16` |
| Chalkboard green (brand / primary / On-device) |                  | `#2f6f4f` |
| Cloud blue (Cloud state)                       |                  | `#2d5d9f` |
| Lamp amber (Queued / waiting / warnings)       |                  | `#8c6010` |
| Correction red (destructive, rare)             |                  | `#a8322a` |

Rules and tokens: [12 §2](12-design-system.md#2-design-tokens). Max **one** accent colour per area besides status badges.

### Typography identity

- **Atkinson Hyperlegible** (Regular 400, Bold 700), free (SIL OFL 1.1), designed by the Braille Institute for maximum legibility. Bundled with the app (`@fontsource/atkinson-hyperlegible`) so it works offline. Fallback: system UI fonts.
- Why: teachers read on cheap screens in bright rooms; distinct letter shapes (I/l/1, O/0) help; it signals "education and accessibility", not "tech startup".

### Iconography

Text-first. Status symbols ✓ … ○ ✕ always with a text label. If icons are added later: simple 2 px outline, 20 px, rounded joins, ink colour. Never decorative icons with no meaning.

### Illustration direction (AI scene images)

The image prompt is fixed in code ([08 §4.6](08-ai-architecture.md#46-image-prompt-generatesceneimage)):

- simple, friendly classroom illustration, flat colours, clear subject, **no text or letters**, 16:9;
- diverse, respectful depiction of people; everyday settings learners recognise.
  Avoid photorealism (uncanny, slower), busy backgrounds, and brand logos.

### Motifs and surfaces

Paper background, white cards with thin borders, no shadows, no glassmorphism, no decorative gradients. The only gradient allowed is the **placeholder frame** for scenes without an image (green → blue), which signals "image coming".

## 4. Brand usage

| Context            | Rule                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| App header         | Mark + wordmark lock-up, 24 px mark                                                                                                          |
| Favicon / app icon | Mark only; PWA icon = mark on paper background with 10% padding (192 and 512 px)                                                             |
| Demo video         | Lock-up on paper for 2 s at start and end; tagline on the end card                                                                           |
| Devpost thumbnail  | Paper background, lock-up, tagline, one screenshot of the On-device badge                                                                    |
| README             | Mark at top (48 px) next to the title                                                                                                        |
| Colour contrast    | All text pairs must meet WCAG AA ([14 Accessibility](14-accessibility.md))                                                                   |
| Consistency        | Same names everywhere: "On-device", "Cloud", "Queued", "storyboard", "scene", "narration"                                                    |
| Sponsor marks      | **Don't** use Google/Firebase logos in a way that suggests sponsorship (hackathon rule). Mention "Built with Firebase AI Logic" in text only |
