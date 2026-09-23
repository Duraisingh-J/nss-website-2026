# NSS Intro Experience — "A Movement of Many"

> **IMPORTANT ARCHITECTURAL NOTICE:**  
> **This module is currently NOT integrated into the production NSS website.**  
> It is an isolated, standalone, experimental visual identity and intro experience. It has zero effect on existing production routes, bundles, homepage, or deployment configuration.

---

## 1. Purpose of the Module

The **NSS Intro Experience** is a cinematic, story-driven digital introduction designed around the core concept:

$$\text{Many Volunteers} \longrightarrow \text{Many Stories} \longrightarrow \text{One NSS Movement}$$

It visualizes individual photography moments from various NSS service activities (literacy drives, blood donations, tree plantations, disaster relief, village camps) dynamically floating across the screen and converging into the geometric silhouette of the **NSS Konark Sun Chariot Wheel**, followed by a configurable countdown, motto reveal, and interactive portal enter transition.

---

## 2. Why It Is Isolated

1. **Zero Bundle Impact**: The production CRA website bundle remains 100% clean with zero added weight.
2. **Independent Lifecycle**: The intro can be designed, tested, animated, and refined without touching the existing React router or live pages.
3. **Safe Experimentation**: Visual effects, GPU acceleration, and timing tweaks can be validated independently.

---

## 3. How to Run Locally

Navigate into the `nss-intro` folder and start the independent Vite dev server:

```bash
cd nss-intro
npm install
npm run dev
```

The intro experience will be available at:  
`http://localhost:5174` (or the next available port).

---

## 4. How to Build Standalone

To build the standalone intro experience into static assets:

```bash
cd nss-intro
npm run build
```

The output will be created inside `nss-intro/dist/`.

---

## 5. Folder Structure

```text
nss-intro/
├── README.md               # Documentation & integration roadmap
├── .gitignore              # Ignores nss-intro/node_modules and dist
├── package.json            # Independent dependencies (Vite + React + Lucide)
├── vite.config.js          # Dedicated Vite configuration
├── index.html              # Dedicated entry point with cinematic Google Fonts
└── src/
    ├── main.jsx            # Entry point mount
    ├── App.jsx             # Main sequence state coordinator
    ├── index.css           # Cinematic dark design system & GPU keyframes
    ├── config/
    │   └── introConfig.js  # Centralized CMS-ready configuration
    ├── data/
    │   └── defaultPhotos.js# Curated NSS photography moments
    ├── components/
    │   ├── BackgroundAmbience.jsx # Cosmic & navy atmospheric glow
    │   ├── IntroMessage.jsx       # Prologue typography reveal
    │   ├── PhotoConvergence.jsx   # Photo cards converging into the NSS wheel
    │   ├── CountdownSection.jsx   # Milestone-based countdown
    │   ├── EnterExperience.jsx    # Magnetic CTA & portal transition
    │   ├── SkipControl.jsx        # Unobtrusive skip button
    │   └── ConfigPanel.jsx        # Live Dev/Tester preview drawer
    └── utils/
        └── mathUtils.js           # Konark Wheel circular geometry math
```

---

## 6. Centralized Configuration Options (`src/config/introConfig.js`)

All parameters are structured for future CMS integration:

| Key | Type | Description |
| :--- | :--- | :--- |
| `enabled` | `boolean` | Master toggle for the intro experience |
| `skipEnabled` | `boolean` | Controls visibility of the "Skip Intro" button |
| `debugControlsEnabled` | `boolean` | Enables bottom-right testing drawer |
| `prologue` | `object` | Introductory text lines displayed during phase 1 |
| `branding` | `object` | Organization name, motto, unit details, and tagline |
| `countdown` | `object` | Duration (seconds), milestone words mapping, and auto-advance |
| `interactiveEnter`| `object` | Button label, portal headline, and transition timing |
| `timings` | `object` | Duration of each animation phase in milliseconds |
| `visuals` | `object` | Spoke count, palette colors, and glow intensity |

---

## 7. How Photographs Are Supplied

Photographs are defined in `src/data/defaultPhotos.js`. Each photo object contains:

```javascript
{
  id: "photo-1",
  title: "Youth Leadership Camp",
  category: "Leadership",
  location: "National Integration Camp",
  year: "2025",
  url: "https://...",
  fallbackColor: "#1d3557",
  quote: "A collective step towards change"
}
```

- When converging, photos calculate their angular trajectory based on the index position in the Konark Wheel circle.
- Responsive breakpoints automatically scale and reposition cards for mobile devices.

---

## 8. How the Countdown Is Configured

The countdown counts down from `durationSeconds` (default: 6s) and updates the milestone headline dynamically:

```text
6s → PEOPLE (Driven by empathy and selfless service)
5s → STORIES (Every volunteer brings a unique heartbeat)
4s → ACTIONS (Grassroots impact where it matters most)
3s → COMMUNITIES (Bridging campus knowledge and social reality)
2s → ONE PURPOSE (Standing together for national progress)
1s → NOT ME, BUT YOU (The spirit of National Service Scheme)
0s → NSS (A Movement of Many)
```

---

## 9. Future Production Integration Roadmap

When ready to integrate the intro into the main website:
1. **Lazy Loading**: Import `nss-intro` using `React.lazy()` inside the main app to avoid bloating initial bundle size.
2. **Session Storage Flag**: Store `sessionStorage.setItem('nss_intro_seen', 'true')` upon completion or skip so repeat visitors immediately see the homepage.
3. **Route Integration**: Trigger the intro on the root path `/` or as a cinematic modal before transitioning to `<Home />`.
