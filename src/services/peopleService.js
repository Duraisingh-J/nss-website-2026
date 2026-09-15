import { supabase } from "../lib/supabase.js";

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
 * Resolves a public URL for a storage path in the public-media bucket
 */
export function getMediaPublicUrl(storagePath) {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  const { data } = supabase.storage
    .from("public-media")
    .getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

/**
 * Transforms a raw Supabase relational row into the shape expected by UI components
 */
export function transformPerson(row) {
  if (!row) return null;

  const roleName = row.roles?.name || "Member";
  const formattedUnit = formatUnit(row.unit);
  const formattedYear = formatYear(row.year);
  const photoUrl = getMediaPublicUrl(row.media?.storage_path);

  const rawDept = row.department || row.bio || "";
  const deptFormatted = rawDept
    ? rawDept.startsWith("Dept.") || rawDept.startsWith("Department")
      ? rawDept
      : `Dept. of ${rawDept}`
    : null;

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
    initials: getInitials(row.name),
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

  const programOfficers = allPeople.filter(
    (p) => p.roleName?.toLowerCase().includes("program officer") || p.roleName?.toLowerCase().includes("programme officer")
  );

  const treasurers = allPeople.filter(
    (p) => p.roleName?.toLowerCase().includes("treasurer")
  );

  const sessionCoordinators = allPeople.filter(
    (p) => p.roleName?.toLowerCase().includes("session coordinator")
  );

  const reportHeads = allPeople.filter(
    (p) => p.roleName?.toLowerCase().includes("report head")
  );

  const designHeads = allPeople.filter(
    (p) => p.roleName?.toLowerCase().includes("design head")
  );

  const unitIncharges = allPeople.filter(
    (p) => p.roleName?.toLowerCase().includes("unit leader") || p.roleName?.toLowerCase().includes("unit incharge")
  );

  const volunteers = allPeople.filter(
    (p) =>
      p.roleName?.toLowerCase().includes("volunteer") ||
      (!programOfficers.includes(p) &&
        !treasurers.includes(p) &&
        !sessionCoordinators.includes(p) &&
        !reportHeads.includes(p) &&
        !designHeads.includes(p) &&
        !unitIncharges.includes(p) &&
        p !== nssCoordinator)
  );

  return {
    all: allPeople,
    nssCoordinator,
    programOfficers,
    treasurers,
    sessionCoordinators,
    reportHeads,
    designHeads,
    unitIncharges,
    volunteers,
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

/**
 * Fetches roles from roles table
 */
export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, display_order")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Creates a new Person in Supabase
 */
export async function createPerson(payload) {
  const insertData = {
    name: payload.name.trim(),
    designation: payload.designation.trim(),
    role_id: payload.role_id,
    department: payload.department.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    unit: payload.unit ? parseInt(payload.unit, 10) : null,
    year: payload.year ? parseInt(payload.year, 10) : null,
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
  const updateData = {
    name: payload.name.trim(),
    designation: payload.designation.trim(),
    role_id: payload.role_id,
    department: payload.department.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    unit: payload.unit ? parseInt(payload.unit, 10) : null,
    year: payload.year ? parseInt(payload.year, 10) : null,
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
 * Uploads a photo to Supabase Storage 'public-media' bucket and creates a row in 'media' table
 */
export async function uploadPersonPhoto(file) {
  if (!file) return null;
  const fileExt = file.name.split(".").pop();
  const fileName = `person-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const storagePath = `people/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("public-media")
    .upload(storagePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: mediaRow, error: mediaError } = await supabase
    .from("media")
    .insert({
      file_name: fileName,
      storage_path: storagePath,
      mime_type: file.type || "image/jpeg",
      file_size: file.size || 1024,
      alt_text: file.name,
    })
    .select("id, storage_path, file_name")
    .single();

  if (mediaError) throw mediaError;

  const { data: { publicUrl } } = supabase.storage
    .from("public-media")
    .getPublicUrl(storagePath);

  return {
    id: mediaRow.id,
    storagePath: mediaRow.storage_path,
    publicUrl,
  };
}
