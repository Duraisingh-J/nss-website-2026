import { supabase } from "../lib/supabase.js";

/**
 * Normalizes PostgreSQL / Supabase errors into human-readable institutional messages
 */
function handleRoleError(error) {
  if (!error) return new Error("An unexpected error occurred.");
  
  // PostgreSQL 23505: unique_violation
  if (error.code === "23505" || error.message?.toLowerCase().includes("duplicate")) {
    return new Error("A role with this name already exists.");
  }

  // PostgreSQL 23503: foreign_key_violation
  if (error.code === "23503" || error.message?.toLowerCase().includes("foreign key")) {
    return new Error("This role is currently assigned to people and cannot be deleted. Reassign those people to another role first.");
  }

  return new Error(error.message || "An error occurred while processing the role.");
}

/**
 * Fetches all roles from the database with assigned people count
 */
export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, display_order, created_at, updated_at, people:people(count)")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw handleRoleError(error);
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    display_order: row.display_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    people_count: row.people?.[0]?.count ?? 0,
  }));
}

/**
 * Fetches a single role by ID with assigned people count
 */
export async function getRole(id) {
  if (!id) throw new Error("Role ID is required.");

  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, display_order, created_at, updated_at, people:people(count)")
    .eq("id", id)
    .single();

  if (error) {
    throw handleRoleError(error);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    display_order: data.display_order ?? 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    people_count: data.people?.[0]?.count ?? 0,
  };
}

/**
 * Creates a new role
 * Validates non-empty trimmed name and handles uniqueness gracefully
 */
export async function createRole(payload) {
  const trimmedName = payload?.name?.trim();
  if (!trimmedName) {
    throw new Error("Role name is required.");
  }

  const insertData = {
    name: trimmedName,
    description: payload?.description?.trim() || null,
  };

  const { data, error } = await supabase
    .from("roles")
    .insert(insertData)
    .select("id, name, description, display_order, created_at, updated_at")
    .single();

  if (error) {
    throw handleRoleError(error);
  }

  return {
    ...data,
    people_count: 0,
  };
}

/**
 * Updates an existing role
 * Validates non-empty trimmed name and handles uniqueness gracefully
 */
export async function updateRole(id, payload) {
  if (!id) throw new Error("Role ID is required.");

  const trimmedName = payload?.name?.trim();
  if (!trimmedName) {
    throw new Error("Role name is required.");
  }

  const updateData = {
    name: trimmedName,
    description: payload?.description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("roles")
    .update(updateData)
    .eq("id", id)
    .select("id, name, description, display_order, created_at, updated_at, people:people(count)")
    .single();

  if (error) {
    throw handleRoleError(error);
  }

  return {
    ...data,
    people_count: data.people?.[0]?.count ?? 0,
  };
}

/**
 * Deletes a role after verifying no People reference it
 * Enforces ON DELETE RESTRICT behavior safely
 */
export async function deleteRole(id) {
  if (!id) throw new Error("Role ID is required.");

  // 1. Verify if any people currently reference this role
  const { count, error: countError } = await supabase
    .from("people")
    .select("id", { count: "exact", head: true })
    .eq("role_id", id);

  if (countError) {
    throw handleRoleError(countError);
  }

  if (count && count > 0) {
    const error = new Error(
      `This role is currently assigned to ${count} ${count === 1 ? "person" : "people"} and cannot be deleted. Reassign those people to another role first.`
    );
    error.code = "ROLE_IN_USE";
    error.assignedCount = count;
    throw error;
  }

  // 2. Perform deletion
  const { error: deleteError } = await supabase
    .from("roles")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw handleRoleError(deleteError);
  }

  return true;
}
