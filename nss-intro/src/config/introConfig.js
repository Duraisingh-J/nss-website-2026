import { DEFAULT_PHOTOS } from '../data/defaultPhotos';

/**
 * NSS Intro Centralized Configuration
 * Hero Opening Sequence: Photo Field -> Convergence -> Official NSS Logo Reveal -> Motto -> Countdown -> Enter
 */
export const introConfig = {
  // Master switches
  enabled: true,
  skipEnabled: true,
  debugControlsEnabled: true,

  // Prologue & Headline Copy
  prologue: {
    tag: "NATIONAL SERVICE SCHEME",
    line1: "Every movement starts with a single step.",
    line2: "Across hundreds of villages, thousands of volunteers, and countless moments...",
  },

  // Brand / Motto identity
  branding: {
    organizationName: "NATIONAL SERVICE SCHEME",
    unitTagline: "Anna University • MIT Campus Unit",
    motto: "NOT ME, BUT YOU",
    subheading: "A movement of many.",
    movementStatement: "Many people. Many stories. One movement.",
    officialLogoUrl: "/images/NSS_logo.png"
  },

  // Countdown configuration
  countdown: {
    enabled: true,
    durationSeconds: 6,
    autoAdvanceOnComplete: true,
    milestones: [
      { atSecond: 6, keyword: "PEOPLE", subtext: "Driven by empathy and selfless service" },
      { atSecond: 5, keyword: "STORIES", subtext: "Every volunteer brings a unique heartbeat" },
      { atSecond: 4, keyword: "ACTIONS", subtext: "Grassroots impact where it matters most" },
      { atSecond: 3, keyword: "COMMUNITIES", subtext: "Bridging campus knowledge and social reality" },
      { atSecond: 2, keyword: "ONE PURPOSE", subtext: "Standing together for national progress" },
      { atSecond: 1, keyword: "NOT ME, BUT YOU", subtext: "The spirit of National Service Scheme" },
      { atSecond: 0, keyword: "NSS", subtext: "A Movement of Many" }
    ]
  },

  // Interactive Enter state configuration
  interactiveEnter: {
    buttonLabel: "ENTER EXPERIENCE",
    portalTransitionDurationMs: 1400,
    portalHeadline: "WELCOME TO NSS",
    portalSubtext: "Inspiring youth, transforming communities, and building the future since 1969."
  },

  // Animation Timings (in milliseconds)
  timings: {
    prologueDuration: 2800,       // Opening brief statement
    photoFieldDuration: 3000,     // Space photo field buildup
    convergenceDuration: 2200,    // Controlled drift toward center
    logoRevealDuration: 1800,     // Official NSS logo emergence
    logoHoldDuration: 2200,       // Clean logo hold before motto
    mottoHoldDuration: 2400,      // Motto reveal duration
    portalTransitionDuration: 1400
  },

  // Visual layout settings
  visuals: {
    primaryColor: "#E63946",    // NSS Crimson Red
    secondaryColor: "#1D3557",  // NSS Royal Navy Blue
    goldColor: "#E0A96D",       // Radiant Accent Gold
    bgDark: "#070709",          // Obsidian background
  },

  // Curated photo dataset
  photos: DEFAULT_PHOTOS
};
