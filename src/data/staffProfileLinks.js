// ============================================================================
// STAFF PROFILE LINKS MAPPING
// ============================================================================
// Centralized frontend mapping for staff & faculty external profile URLs.
//
// HOW TO ADD / EDIT PROFILE LINKS:
// 1. Find the staff member below.
// 2. Paste their external URL inside the quotes:
//      "PERSON_ID": "https://example.com/profile",
// 3. Save the file.
//
// IDENTIFIERS:
// - Primary key: The person's database ID (`person.id`).
// - Fallback key: The person's exact name (`person.name`), provided for convenience.
//
// EMPTY URL BEHAVIOR:
// - Leaving a person's URL empty ("") or omitting them makes the card normal
//   and non-clickable. It will NOT navigate to undefined, #, or blank.
// ============================================================================

export const staffProfileLinks = {
  // ── 1. CAMPUS LEADERSHIP: NSS COORDINATOR ─────────────────────────────────
  // Dr. K.M. Veerabadran (NSS Campus Coordinator)
  "Dr. K.M. VEERABADRAN": "https://www.auegov.ac.in/HomePage/?Auth=wbNzRUw=",

  // ── 2. FACULTY INCHARGES: PROGRAMME OFFICERS ───────────────────────────────
  // Unit I Programme Officer
  "Dr. J. Ramajothi": "https://www.auegov.ac.in/HomePage/?Auth=wbtzSUs=",

  // Unit II Programme Officer
  "Dr. K. MARIAMMAL": "https://www.auegov.ac.in/HomePage/?Auth=wbVxSE4=",

  // Unit III Programme Officer
  "Dr. S. NEELAVATHY PARI": "https://www.auegov.ac.in/HomePage/?Auth=wbVySUw=",

  // Unit IV Programme Officer
  "Dr. A. DIVYA": "https://www.auegov.ac.in/HomePage/?Auth=wbt0R0o=",

  // Unit V Programme Officer
  "Dr. M. MANOJ": "https://www.auegov.ac.in/HomePage/?Auth=wLJzQE++",

  // Unit VI Programme Officer (Dr. K.M. Veerabadran)
  // (Covered by Coordinator entry above)

  // Unit VII Programme Officer
  "Dr. G. KUMARESAN": "",
};

/**
 * Normalizes a name string for resilient case-insensitive and punctuation-insensitive matching.
 */
function cleanStr(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .toLowerCase()
    .replace(/^(dr\.|dr|prof\.|prof|mr\.|mr|ms\.|ms|mrs\.|mrs)\s*/i, "") // strip academic titles
    .replace(/[^a-z0-9]/g, "") // strip all dots, spaces, special chars
    .trim();
}

/**
 * Resolves a person's external profile URL from the staffProfileLinks mapping.
 * Resiliently checks:
 * 1. Direct profileUrl property if already set
 * 2. Exact match by person.id
 * 3. Exact match by person.name
 * 4. Normalized case-insensitive & punctuation-insensitive name match
 * 5. Distinct surname/token match (e.g. 'mariammal', 'neelavathy', 'dhivya', 'manoj', 'veerabadran')
 * 6. Unit matching (e.g. 'Unit II', 'Unit 2')
 * 
 * @param {Object} person - The person object or database row
 * @returns {string} The trimmed profile URL or empty string
 */
export function getStaffProfileUrl(person) {
  if (!person) return "";

  // 1. Direct profileUrl property if already populated
  if (person.profileUrl && typeof person.profileUrl === "string" && person.profileUrl.trim()) {
    return person.profileUrl.trim();
  }

  // 2. Exact match by person.id (primary)
  if (person.id && staffProfileLinks[person.id]) {
    const url = staffProfileLinks[person.id];
    if (typeof url === "string" && url.trim()) return url.trim();
  }

  // 3. Exact match by person.name
  if (person.name && staffProfileLinks[person.name]) {
    const url = staffProfileLinks[person.name];
    if (typeof url === "string" && url.trim()) return url.trim();
  }

  const pClean = cleanStr(person.name);
  const pUnit = String(person.unit ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const pRole = String(person.role || person.roleName || person.roles?.name || "").toLowerCase();

  // 4. Smart resilient matching across all configured entries
  for (const [key, rawUrl] of Object.entries(staffProfileLinks)) {
    if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) continue;
    const url = rawUrl.trim();

    // Check key against person.id
    if (person.id && String(key).trim() === String(person.id).trim()) {
      return url;
    }

    const kClean = cleanStr(key);

    // Exact normalized match (handles case/dot differences like "Dr. K. MARIAMMAL" vs "Dr. K. Mariammal")
    if (kClean && pClean && kClean === pClean) {
      return url;
    }

    // Token substring match (e.g. key has "mariammal" and person has "mariammal")
    if (kClean && pClean) {
      if (kClean.length >= 5 && pClean.includes(kClean)) return url;
      if (pClean.length >= 5 && kClean.includes(pClean)) return url;
    }

    // Unit matching (e.g. key is "Unit II" and person is in Unit II or unit 2)
    const kUnit = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (kUnit && pUnit) {
      if (kUnit.startsWith("unit") && (pUnit === kUnit || pUnit.includes(kUnit) || kUnit.includes(pUnit))) {
        return url;
      }
      const romanMap = { uniti: "1", unitii: "2", unitiii: "3", unitiv: "4", unitv: "5", unitvi: "6", unitvii: "7" };
      if (romanMap[kUnit] && (pUnit === romanMap[kUnit] || pUnit === `unit${romanMap[kUnit]}`)) {
        return url;
      }
    }

    // Campus Coordinator role match
    if (pRole.includes("coordinator") && !pRole.includes("session")) {
      if (kClean.includes("veerabadran") || key.toLowerCase().includes("coordinator")) {
        return url;
      }
    }
  }

  return "";
}

export default staffProfileLinks;
