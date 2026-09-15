import React, { useState, useEffect, useCallback } from "react";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../services/roleService.js";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Shield,
  AlertTriangle,
} from "lucide-react";
import "../../styles/admin.css";

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
};

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Blocked deletion modal state (when assigned to people)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [blockedRole, setBlockedRole] = useState(null);

  // Load all roles from Supabase
  const loadRolesData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles:", err);
      setErrorNotice(err.message || "Unable to fetch roles from Supabase.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRolesData();
  }, [loadRolesData]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successNotice) {
      const timer = setTimeout(() => setSuccessNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successNotice]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingRole(null);
    setFormData(INITIAL_FORM_STATE);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || "",
      description: role.description || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Close Form Modal
  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData(INITIAL_FORM_STATE);
    setFormError(null);
  };

  // Save Role (Create or Update)
  const handleSaveRole = async (e) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError("Role name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: trimmedName,
        description: formData.description.trim() || null,
      };

      if (editingRole) {
        await updateRole(editingRole.id, payload);
        setSuccessNotice(`Role "${trimmedName}" updated successfully.`);
      } else {
        await createRole(payload);
        setSuccessNotice(`Role "${trimmedName}" created successfully.`);
      }

      handleCloseModal();
      await loadRolesData(true);
    } catch (err) {
      console.error("Failed to save role:", err);
      setFormError(err.message || "Failed to save role.");
    } finally {
      setIsSaving(false);
    }
  };

  // Initiate Delete Check
  const handleDeleteClick = (role) => {
    setDeleteError(null);
    // If role has people assigned, immediately show the institutional blocked modal
    if (role.people_count > 0) {
      setBlockedRole(role);
      setIsBlockedModalOpen(true);
    } else {
      setRoleToDelete(role);
      setIsDeleteModalOpen(true);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteRole(roleToDelete.id);
      setSuccessNotice(`Role "${roleToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      await loadRolesData(true);
    } catch (err) {
      console.error("Failed to delete role:", err);
      if (err.code === "ROLE_IN_USE" || err.assignedCount > 0) {
        setIsDeleteModalOpen(false);
        setBlockedRole(roleToDelete);
        setIsBlockedModalOpen(true);
      } else {
        setDeleteError(err.message || "Unable to delete role.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Roles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage the NSS roles assigned to people in the organization.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadRolesData(true)}
            disabled={refreshing || loading}
            title="Refresh roles list"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-md shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {successNotice && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => loadRolesData(true)}
            className="text-xs underline font-medium hover:text-red-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* DATA TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
            <p className="text-xs">Loading organizational roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No roles have been created yet.
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Define the responsibilities and positions assigned to NSS MIT volunteers and coordinators.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold tracking-wider uppercase text-[10px]">
                  <th className="py-3 px-4 w-1/4">Role</th>
                  <th className="py-3 px-4 w-1/2">Description</th>
                  <th className="py-3 px-4 text-center w-28">People Assigned</th>
                  <th className="py-3 px-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((role) => {
                  const hasAssignedPeople = role.people_count > 0;
                  return (
                    <tr
                      key={role.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Role Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{role.name}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                        {role.description ? (
                          <span>{role.description}</span>
                        ) : (
                          <span className="text-slate-400 italic">No description provided</span>
                        )}
                      </td>

                      {/* People Assigned Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            hasAssignedPeople
                              ? "bg-slate-100 text-slate-800"
                              : "bg-slate-50 text-slate-400 border border-slate-200/60"
                          }`}
                        >
                          {role.people_count}{" "}
                          {role.people_count === 1 ? "person" : "people"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(role)}
                            title="Edit role"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(role)}
                            title={
                              hasAssignedPeople
                                ? `Cannot delete: assigned to ${role.people_count} ${role.people_count === 1 ? "person" : "people"}`
                                : "Delete role"
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              hasAssignedPeople
                                ? "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                                : "text-slate-500 hover:text-red-700 hover:bg-red-50"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">
                {editingRole ? "Edit Role" : "Add Role"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600 rounded-md p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start space-x-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Role Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Role Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Unit Coordinator"
                  className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the organizational duties..."
                  className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 resize-none"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-md shadow-2xs transition-colors disabled:opacity-60"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSaving
                      ? "Saving..."
                      : editingRole
                      ? "Save Changes"
                      : "Save Role"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG (When people_count === 0) */}
      {isDeleteModalOpen && roleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Delete role?
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-900 font-semibold">
                    "{roleToDelete.name}"
                  </strong>
                  ? This action cannot be undone.
                </p>

                {deleteError && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                    {deleteError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setRoleToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCKED DELETION DIALOG (When people_count > 0) */}
      {isBlockedModalOpen && blockedRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Cannot Delete Role
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  This role is currently assigned to{" "}
                  <strong className="text-slate-900 font-semibold">
                    {blockedRole.people_count}{" "}
                    {blockedRole.people_count === 1 ? "person" : "people"}
                  </strong>{" "}
                  and cannot be deleted. Reassign those people to another role first.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsBlockedModalOpen(false);
                  setBlockedRole(null);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
