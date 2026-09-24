import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAdminPeople,
  getRoles,
  createPerson,
  updatePerson,
  deletePerson,
  togglePersonStatus,
  uploadPersonPhoto,
} from "../../services/peopleService.js";
import { validateImageFile } from "../../utils/imageOptimizer.js";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
} from "lucide-react";
import "../../styles/admin.css";

const UNIT_OPTIONS = [
  { value: "", label: "No specific unit" },
  { value: "1", label: "Unit I" },
  { value: "2", label: "Unit II" },
  { value: "3", label: "Unit III" },
  { value: "4", label: "Unit IV" },
  { value: "5", label: "Unit V" },
  { value: "6", label: "Unit VI" },
  { value: "7", label: "Unit VII" },
];

const YEAR_OPTIONS = [
  { value: "", label: "Not applicable" },
  { value: "1", label: "First Year (1)" },
  { value: "2", label: "Second Year (2)" },
  { value: "3", label: "Third Year (3)" },
  { value: "4", label: "Final Year (4)" },
];

const INITIAL_FORM_STATE = {
  name: "",
  role_id: "",
  designation: "",
  department: "",
  unit: "",
  year: "",
  registration_number: "",
  phone: "",
  email: "",
  bio: "",
  photo_media_id: null,
  photo_preview: null,
  is_active: true,
};

export default function PeopleManagement() {
  const [people, setPeople] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Photo upload states
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all people and roles
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const [peopleList, rolesList] = await Promise.all([
        getAdminPeople(),
        getRoles(),
      ]);
      setPeople(peopleList);
      setRoles(rolesList);
    } catch (err) {
      console.error("Failed to load people/roles:", err);
      setErrorNotice("Unable to fetch personnel records from Supabase.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dismiss alert notices automatically
  useEffect(() => {
    if (successNotice) {
      const t = setTimeout(() => setSuccessNotice(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successNotice]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPerson(null);
    setFormData({
      ...INITIAL_FORM_STATE,
      role_id: roles.length > 0 ? roles[0].id : "",
    });
    setPhotoFile(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name || "",
      role_id: person.role_id || "",
      designation: person.designation || "",
      department: person.department || "",
      unit: person.rawUnit ? String(person.rawUnit) : "",
      year: person.rawYear ? String(person.rawYear) : "",
      registration_number: person.registration_number || "",
      phone: person.phone || "",
      email: person.email || "",
      bio: person.bio || "",
      photo_media_id: person.photo_media_id || null,
      photo_preview: person.image || null,
      is_active: person.is_active,
    });
    setPhotoFile(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Close Form Modal
  const handleCloseModal = () => {
    if (isSaving || isUploadingPhoto) return;
    setIsModalOpen(false);
    setEditingPerson(null);
    setFormData(INITIAL_FORM_STATE);
    setPhotoFile(null);
    setFormError(null);
  };

  // Handle Photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setPhotoFile(file);
      setFormData((prev) => ({
        ...prev,
        photo_preview: URL.createObjectURL(file),
      }));
      setFormError(null);
    } catch (err) {
      setFormError(err.message || "Please select a valid image file (JPEG, PNG, WebP).");
    }
  };

  // Remove selected photo
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setFormData((prev) => ({
      ...prev,
      photo_media_id: null,
      photo_preview: null,
    }));
  };

  // Save Person (Create or Update)
  const handleSavePerson = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate required fields based on DB constraints
    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!formData.role_id) {
      setFormError("Please select a role.");
      return;
    }
    if (!formData.designation.trim()) {
      setFormError("Designation is required.");
      return;
    }
    if (!formData.department.trim()) {
      setFormError("Department is required by the database.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Phone is required by the database.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Email is required by the database.");
      return;
    }
    if (formData.unit !== "" && formData.unit !== null && formData.unit !== undefined) {
      const u = parseInt(formData.unit, 10);
      if (isNaN(u) || u < 1 || u > 7) {
        setFormError("Unit must be between 1 and 7.");
        return;
      }
    }
    if (formData.year !== "" && formData.year !== null && formData.year !== undefined) {
      const y = parseInt(formData.year, 10);
      if (isNaN(y) || y < 1 || y > 4) {
        setFormError("Year must be between 1 and 4.");
        return;
      }
    }

    setIsSaving(true);

    try {
      let finalPhotoMediaId = formData.photo_media_id;

      // If user uploaded a new photo, upload to Storage and insert media row
      if (photoFile) {
        setIsUploadingPhoto(true);
        const uploadedMedia = await uploadPersonPhoto(photoFile);
        if (uploadedMedia) {
          finalPhotoMediaId = uploadedMedia.id;
        }
        setIsUploadingPhoto(false);
      }

      const payload = {
        name: formData.name,
        role_id: formData.role_id,
        designation: formData.designation,
        department: formData.department,
        unit: formData.unit,
        year: formData.year,
        registration_number: formData.registration_number,
        phone: formData.phone,
        email: formData.email,
        bio: formData.bio,
        photo_media_id: finalPhotoMediaId,
        is_active: formData.is_active,
      };

      if (editingPerson) {
        await updatePerson(editingPerson.id, payload);
        setSuccessNotice(`Updated "${formData.name.trim()}" successfully.`);
      } else {
        await createPerson(payload);
        setSuccessNotice(`Created "${formData.name.trim()}" successfully.`);
      }

      setIsModalOpen(false);
      setEditingPerson(null);
      setPhotoFile(null);
      await loadData();
    } catch (err) {
      console.error("Save error:", err);
      setFormError(err.message || "Failed to save person record. Please verify constraints.");
    } finally {
      setIsSaving(false);
      setIsUploadingPhoto(false);
    }
  };

  // Quick toggle status (Active / Inactive)
  const handleToggleStatus = async (person) => {
    const nextStatus = !person.is_active;
    try {
      await togglePersonStatus(person.id, nextStatus);
      setPeople((prev) =>
        prev.map((p) => (p.id === person.id ? { ...p, is_active: nextStatus } : p))
      );
      setSuccessNotice(
        `"${person.name}" is now ${nextStatus ? "Active (Visible publicly)" : "Inactive (Hidden)"}.`
      );
    } catch (err) {
      console.error("Toggle error:", err);
      setErrorNotice("Unable to update status.");
    }
  };

  // Open Delete Confirmation
  const handleOpenDeleteModal = (person) => {
    setPersonToDelete(person);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!personToDelete) return;
    setIsDeleting(true);

    try {
      await deletePerson(personToDelete.id);
      setPeople((prev) => prev.filter((p) => p.id !== personToDelete.id));
      setSuccessNotice(`Deleted "${personToDelete.name}" successfully.`);
      setIsDeleteModalOpen(false);
      setPersonToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorNotice("Failed to delete person.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and searched people list
  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      // Search query (name, designation, reg, department)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = person.name?.toLowerCase().includes(query);
        const matchesDesig = person.designation?.toLowerCase().includes(query);
        const matchesReg = person.registration_number?.toLowerCase().includes(query);
        const matchesDept = person.department?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesig && !matchesReg && !matchesDept) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "all" && person.role_id !== roleFilter) {
        return false;
      }

      // Unit filter
      if (unitFilter !== "all") {
        if (unitFilter === "none") {
          if (person.rawUnit) return false;
        } else {
          if (String(person.rawUnit) !== unitFilter) return false;
        }
      }

      // Status filter
      if (statusFilter === "active" && !person.is_active) return false;
      if (statusFilter === "inactive" && person.is_active) return false;

      return true;
    });
  }, [people, searchQuery, roleFilter, unitFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            People Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure and manage NSS campus leaders, programme officers, heads, and unit personnel.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Reload records"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : "text-slate-400"}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* NOTICES */}
      {errorNotice && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-red-500 hover:text-red-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-500 hover:text-emerald-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOOLBAR: SEARCH & FILTERS */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, designation, reg no., or department..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-44 px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full md:w-36 px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
            >
              <option value="all">All Units</option>
              <option value="none">No unit assigned</option>
              <option value="1">Unit I</option>
              <option value="2">Unit II</option>
              <option value="3">Unit III</option>
              <option value="4">Unit IV</option>
              <option value="5">Unit V</option>
              <option value="6">Unit VI</option>
              <option value="7">Unit VII</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-32 px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Counter summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredPeople.length}</strong> of{" "}
            <strong>{people.length}</strong> total records
          </span>
          {(searchQuery || roleFilter !== "all" || unitFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setUnitFilter("all");
                setStatusFilter("all");
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
            <span>Loading personnel directory...</span>
          </div>
        ) : filteredPeople.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Photo</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Unit / Year</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPeople.map((person) => (
                  <tr
                    key={person.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Photo / Avatar */}
                    <td className="py-3 px-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {person.image ? (
                          <img
                            src={person.image}
                            alt={person.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span>{person.initials}</span>
                      </div>
                    </td>

                    {/* Name + Registration Number */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {person.name}
                      </div>
                      {person.registration_number && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Reg: {person.registration_number}
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200/80">
                        {person.roleName}
                      </span>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 text-slate-700">
                      {person.designation || "—"}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {person.department || "—"}
                    </td>

                    {/* Unit / Year */}
                    <td className="py-3 px-4 text-slate-600">
                      {person.unit ? (
                        <span>
                          {person.unit}
                          {person.year ? ` · ${person.year}` : ""}
                        </span>
                      ) : person.year ? (
                        <span>{person.year}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(person)}
                        title={`Click to set as ${person.is_active ? "Inactive" : "Active"}`}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                          person.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            person.is_active ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        <span>{person.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(person)}
                          title="Edit member"
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(person)}
                          title="Delete member"
                          className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-800">
              No personnel records found
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {people.length === 0
                ? "There are currently no records in the people table. Click 'Add Person' to create the first record."
                : "No personnel match your search or active filter settings."}
            </p>
            {people.length === 0 && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Person</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT PERSON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPerson ? "Edit Person Record" : "Add New Person"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePerson} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Photo Upload Row */}
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.photo_preview ? (
                    <img
                      src={formData.photo_preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 text-xs">
                  <div className="font-medium text-slate-800">
                    Profile Photograph
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Upload image to Supabase storage bucket `public-media/people/`
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors">
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>{formData.photo_preview ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        disabled={isSaving}
                        className="hidden"
                      />
                    </label>

                    {formData.photo_preview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={isSaving}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 1: Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Dr. K.M. Veerabadran"
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    NSS Role <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.role_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role_id: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white"
                  >
                    <option value="">Select a role...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Designation & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Designation / Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    placeholder="e.g. Assistant Professor, Unit Leader"
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    placeholder="e.g. Applied Science & Humanities"
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  />
                </div>
              </div>

              {/* Row 3: Unit & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    NSS Unit (Nullable)
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white"
                  >
                    {UNIT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Year (Nullable)
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, year: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white"
                  >
                    {YEAR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Reg. Number
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        registration_number: e.target.value,
                      }))
                    }
                    placeholder="e.g. 2022501001"
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  />
                </div>
              </div>

              {/* Row 4: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="e.g. 04422516142"
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="e.g. member@mitindia.edu"
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  />
                </div>
              </div>

              {/* Row 5: Bio */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bio / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Additional notes or profile description..."
                  className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Active &bull; Visible on public website
                  </span>
                </label>
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
                  disabled={isSaving || isUploadingPhoto}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-md shadow-2xs transition-colors disabled:opacity-60"
                >
                  {(isSaving || isUploadingPhoto) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {isSaving
                      ? "Saving..."
                      : isUploadingPhoto
                      ? "Uploading photo..."
                      : editingPerson
                      ? "Update Person"
                      : "Create Person"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && personToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Delete Person Record
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-slate-900 font-semibold">
                    "{personToDelete.name}"
                  </strong>
                  ? This record will be removed from the database and public directory.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPersonToDelete(null);
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
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
