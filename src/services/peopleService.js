import { supabase } from "../lib/supabase.js";
import { uploadMedia, getMediaPublicUrl } from "./mediaService.js";
import { getStaffProfileUrl } from "../data/staffProfileLinks.js";

export { getMediaPublicUrl, getStaffProfileUrl };

/**
 * Maps numeric unit (1-7) to Roman numeral unit string ("Unit I" - "Unit VII")
 */
export function formatUnit(unit) {
  if (!unit && unit !== 0) return null;
  const num = parseInt(unit, 10);
  const romanMap = {
    1: "Unit I",
    2: "Unit II",
    3: "Unit III",
    4: "Unit IV",
    5: "Unit V",
    6: "Unit VI",
    7: "Unit VII",
  };
  return romanMap[num] || (typeof unit === "string" && unit.startsWith("Unit ") ? unit : `Unit ${unit}`);
}

/**
 * Derives display year text from database year value
 */
export function formatYear(year) {
  if (!year && year !== 0) return null;
  const num = parseInt(year, 10);
  if (num === 4) return "Final Year";
  if (num === 3) return "Pre-Final Year";
  if (num === 2) return "Second Year";
  if (num === 1) return "First Year";
  return String(year);
}

/**
 * Extracts 2-3 letter initials from a person's name
 */
export function getInitials(name) {
  if (!name) return "NSS";
  const cleanName = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+/i, "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NSS";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Standardizes department names to "Department of ..." format (replacing "Dept.")
 */
export function formatDepartment(dept) {
  if (!dept || typeof dept !== "string") return null;
  const trimmed = dept.trim();
  if (!trimmed) return null;

  const cleaned = trimmed
    .replace(/^Dept\.\s*of\s+/i, "")
    .replace(/^Dept\.\s*/i, "")
    .replace(/^Department\s*of\s+/i, "")
    .replace(/^Department\s*/i, "")
    .trim();

  return cleaned ? `Department of ${cleaned}` : null;
}

/**
 * Helper to extract numeric unit (1-7) reliably from integer or Roman string
 */
export function getUnitNumber(unit) {
  if (unit === null || unit === undefined) return 999;
  if (typeof unit === "number") return unit;
  const match = String(unit).match(/\b([1-7])\b/);
  if (match) return parseInt(match[1], 10);
  const u = String(unit).toUpperCase().trim();
  if (u.includes("VII")) return 7;
  if (u.includes("VI")) return 6;
  if (u.includes("IV")) return 4;
  if (u.includes("V")) return 5;
  if (u.includes("III")) return 3;
  if (u.includes("II")) return 2;
  if (u.includes("I")) return 1;
  return 999;
}

/**
 * Transforms a raw Supabase relational row into the shape expected by UI components
 */
export function transformPerson(row) {
  if (!row) return null;

  let rawRoleName = row.roles?.name || "Member";
  // Standardize "Program Officer" to "Programme Officer"
  const roleName = rawRoleName.replace(/\bProgram Officer\b/gi, "Programme Officer");
  const formattedUnit = formatUnit(row.unit);
  const formattedYear = formatYear(row.year);
  const rawPhotoSource = row.media?.storage_path || row.photo_url || row.image || row.photo || null;
  const photoUrl = getMediaPublicUrl(rawPhotoSource);

  const rawDept = row.department || row.bio || "";
  const deptFormatted = formatDepartment(rawDept);

  return {
    id: row.id,
    name: row.name,
    role: roleName,
    role_id: row.role_id,
    roleName: roleName,
    designation: row.designation,
    post: row.designation,
    department: row.department,
    dept: deptFormatted,
    bio: row.bio,
    unit: formattedUnit,
    rawUnit: row.unit,
    year: formattedYear,
    rawYear: row.year,
    registration_number: row.registration_number,
    reg: row.registration_number,
    phone: row.phone,
    email: row.email,
    photo_media_id: row.photo_media_id,
    image: photoUrl,
    originalImage: rawPhotoSource,
    initials: getInitials(row.name),
    profileUrl:
      getStaffProfileUrl({
        id: row.id,
        name: row.name,
        unit: formattedUnit,
        rawUnit: row.unit,
        role: roleName,
        roleName: roleName,
      }) || "",
    badge: formattedUnit ? `${roleName} · ${formattedUnit}` : roleName,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Public query: fetches only active People from Supabase
 */
export async function getPublicPeople() {
  const { data, error } = await supabase
    .from("people")
    .select(`
      id,
      name,
      designation,
      role_id,
      registration_number,
      department,
      year,
      unit,
      phone,
      email,
      photo_media_id,
      bio,
      is_active,
      created_at,
      updated_at,
      roles (
        id,
        name,
        description
      ),
      media:photo_media_id (
        id,
        file_name,
        storage_path,
        mime_type,
        alt_text
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching public people from Supabase:", error);
    throw error;
  }

  const allPeople = (data || []).map(transformPerson);

  const nssCoordinator = allPeople.find(
    (p) => p.roleName?.toLowerCase().includes("coordinator") && !p.roleName?.toLowerCase().includes("session")
  ) || null;

  const programOfficers = allPeople
    .filter(
      (p) =>
        p.roleName?.toLowerCase().includes("program officer") ||
        p.roleName?.toLowerCase().includes("programme officer")
    )
    .sort((a, b) => {
      const unitA = getUnitNumber(a.rawUnit ?? a.unit);
      const unitB = getUnitNumber(b.rawUnit ?? b.unit);
      if (unitA !== unitB) return unitA - unitB;
      return (a.name || "").localeCompare(b.name || "");
    });

  const unitIncharges = allPeople
    .filter(
      (p) =>
        p.roleName?.toLowerCase().includes("unit leader") ||
        p.roleName?.toLowerCase().includes("unit incharge")
    )
    .sort((a, b) => {
      const unitA = getUnitNumber(a.rawUnit ?? a.unit);
      const unitB = getUnitNumber(b.rawUnit ?? b.unit);
      if (unitA !== unitB) return unitA - unitB;
      const yearDiff = (Number(b.rawYear) || 0) - (Number(a.rawYear) || 0);
      if (yearDiff !== 0) return yearDiff;
      return (a.name || "").localeCompare(b.name || "");
    });

  const getRolePriority = (roleName = "") => {
    const role = roleName.toLowerCase();
    if (role.includes("joint treasurer")) return 2;
    if (role.includes("treasurer")) return 1;
    if (role.includes("session")) return 3;
    if (role.includes("report")) return 4;
    if (role.includes("design")) return 5;
    return 6; // Other volunteers / members
  };

  const officeBearers = allPeople.filter(
    (p) =>
      p !== nssCoordinator &&
      !programOfficers.includes(p) &&
      !unitIncharges.includes(p)
  ).sort((a, b) => {
    // 1. Year: Final Years (4) first, then Pre-Final (3)
    const yearDiff = (Number(b.rawYear) || 0) - (Number(a.rawYear) || 0);
    if (yearDiff !== 0) return yearDiff;

    // 2. Specific role order: Treasurer -> Joint Treasurer -> Session -> Report -> Design
    const priorityDiff = getRolePriority(a.roleName) - getRolePriority(b.roleName);
    if (priorityDiff !== 0) return priorityDiff;

    // 3. Alphabetical by Name if same year & role
    return (a.name || "").localeCompare(b.name || "");
  });

  return {
    all: allPeople,
    nssCoordinator,
    programOfficers,
    unitIncharges,
    officeBearers,
  };
}

/**
 * Admin query: fetches all People (both active and inactive)
 */
export async function getAdminPeople() {
  const { data, error } = await supabase
    .from("people")
    .select(`
      id,
      name,
      designation,
      role_id,
      registration_number,
      department,
      year,
      unit,
      phone,
      email,
      photo_media_id,
      bio,
      is_active,
      created_at,
      updated_at,
      roles (
        id,
        name,
        description
      ),
      media:photo_media_id (
        id,
        file_name,
        storage_path,
        mime_type,
        alt_text
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(transformPerson);
}

export { getRoles } from "./roleService.js";

/**
 * Creates a new Person in Supabase
 */
export async function createPerson(payload) {
  let parsedUnit = null;
  if (payload.unit !== null && payload.unit !== undefined && payload.unit !== "") {
    parsedUnit = parseInt(payload.unit, 10);
    if (isNaN(parsedUnit) || parsedUnit < 1 || parsedUnit > 7) {
      throw new Error("Unit must be between 1 and 7.");
    }
  }

  let parsedYear = null;
  if (payload.year !== null && payload.year !== undefined && payload.year !== "") {
    parsedYear = parseInt(payload.year, 10);
    if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
      throw new Error("Year must be between 1 and 4.");
    }
  }

  const insertData = {
    name: payload.name.trim(),
    designation: payload.designation.trim(),
    role_id: payload.role_id,
    department: payload.department.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    unit: parsedUnit,
    year: parsedYear,
    registration_number: payload.registration_number?.trim() || null,
    bio: payload.bio?.trim() || null,
    photo_media_id: payload.photo_media_id || null,
    is_active: payload.is_active !== undefined ? payload.is_active : true,
  };

  const { data, error } = await supabase
    .from("people")
    .insert(insertData)
    .select(`
      id,
      name,
      designation,
      role_id,
      registration_number,
      department,
      year,
      unit,
      phone,
      email,
      photo_media_id,
      bio,
      is_active,
      created_at,
      updated_at,
      roles (
        id,
        name,
        description
      ),
      media:photo_media_id (
        id,
        file_name,
        storage_path,
        mime_type,
        alt_text
      )
    `)
    .single();

  if (error) throw error;
  return transformPerson(data);
}

/**
 * Updates an existing Person in Supabase
 */
export async function updatePerson(id, payload) {
  let parsedUnit = null;
  if (payload.unit !== null && payload.unit !== undefined && payload.unit !== "") {
    parsedUnit = parseInt(payload.unit, 10);
    if (isNaN(parsedUnit) || parsedUnit < 1 || parsedUnit > 7) {
      throw new Error("Unit must be between 1 and 7.");
    }
  }

  let parsedYear = null;
  if (payload.year !== null && payload.year !== undefined && payload.year !== "") {
    parsedYear = parseInt(payload.year, 10);
    if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
      throw new Error("Year must be between 1 and 4.");
    }
  }

  const updateData = {
    name: payload.name.trim(),
    designation: payload.designation.trim(),
    role_id: payload.role_id,
    department: payload.department.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    unit: parsedUnit,
    year: parsedYear,
    registration_number: payload.registration_number?.trim() || null,
    bio: payload.bio?.trim() || null,
    photo_media_id: payload.photo_media_id !== undefined ? payload.photo_media_id : null,
    is_active: payload.is_active !== undefined ? payload.is_active : true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("people")
    .update(updateData)
    .eq("id", id)
    .select(`
      id,
      name,
      designation,
      role_id,
      registration_number,
      department,
      year,
      unit,
      phone,
      email,
      photo_media_id,
      bio,
      is_active,
      created_at,
      updated_at,
      roles (
        id,
        name,
        description
      ),
      media:photo_media_id (
        id,
        file_name,
        storage_path,
        mime_type,
        alt_text
      )
    `)
    .single();

  if (error) throw error;
  return transformPerson(data);
}

/**
 * Deletes a Person from Supabase
 */
export async function deletePerson(id) {
  const { error } = await supabase
    .from("people")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

/**
 * Toggles a Person's active status
 */
export async function togglePersonStatus(id, isActive) {
  const { data, error } = await supabase
    .from("people")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, is_active")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Uploads a person's photo using the centralized image optimization & media pipeline
 */
export async function uploadPersonPhoto(file, personId = null) {
  if (!file) return null;
  return uploadMedia(file, {
    folder: "people",
    entityId: personId,
    altText: file.name,
    quality: 0.85,
    maxDimension: 2400,
  });
}
