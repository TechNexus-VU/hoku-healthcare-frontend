import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ChevronDown,
  Clock,
  DollarSign,
  HeartPulse,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminService,
  deleteAdminService,
  extractService,
  extractServices,
  getAdminServices,
  updateAdminService,
} from "@/services/adminServicesapi";

const SERVICE_CATEGORIES = [
  "Home Health",
  "Palliative Care",
  "Hospice Care",
  "Nursing Care",
  "Physiotherapy",
  "Medical Consultation",
  "General Healthcare",
];

const EMPTY_FORM = {
  name: "",
  category: "",
  description: "",
  duration: "",
  price: "",
  active: true,
};

function formatPrice(value) {
  const price = Number(value) || 0;

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

function normalizeService(service = {}) {
  const activeValue =
    service.is_active ??
    service.active ??
    service.enabled ??
    (service.status
      ? service.status === "active"
      : true);

  return {
    ...service,

    id:
      service.id ??
      service._id ??
      service.service_id ??
      service.serviceId,

    name:
      service.name ||
      service.title ||
      service.service_name ||
      service.serviceName ||
      "Unnamed Service",

    category:
      service.category ||
      service.type ||
      "General Healthcare",

    description:
      service.description ||
      service.details ||
      service.short_description ||
      "No description available.",

    duration: Number(
      service.duration ??
        service.duration_minutes ??
        service.durationMinutes ??
        service.duration_in_minutes ??
        0
    ),

    price: Number(
      service.price ??
        service.fee ??
        service.service_fee ??
        0
    ),

    active: Boolean(activeValue),
  };
}

function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function ServiceModal({
  open,
  service,
  saving,
  error,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  const isEditing = Boolean(service);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (service) {
      setForm({
        name: service.name || "",
        category: service.category || "",
        description: service.description || "",
        duration: String(service.duration ?? ""),
        price: String(service.price ?? ""),
        active: Boolean(service.active),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, service]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const category = form.category.trim();
    const description = form.description.trim();

    if (!name || !category) {
      return;
    }

    await onSave({
      name,
      category,
      description,
      duration_minutes:
        Number(form.duration) || 0,
      price: Number(form.price) || 0,
      is_active: Boolean(form.active),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-['Poppins'] text-lg font-semibold text-[#1A1A2E]">
            {isEditing
              ? "Edit Service"
              : "Add New Service"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-1 text-[#6B7280] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
              Service Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={saving}
              placeholder="Home Health Care"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
              required
            >
              <option value="">
                Select category
              </option>

              {SERVICE_CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={saving}
              rows={4}
              placeholder="Describe this healthcare service..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                Duration (minutes)
              </label>

              <input
                type="number"
                name="duration"
                min="0"
                value={form.duration}
                onChange={handleChange}
                disabled={saving}
                placeholder="60"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                Price (PKR)
              </label>

              <input
                type="number"
                name="price"
                min="0"
                value={form.price}
                onChange={handleChange}
                disabled={saving}
                placeholder="3000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#1A1A2E]">
                Active Service
              </p>

              <p className="text-xs text-[#6B7280]">
                Active services can appear on the
                public website.
              </p>
            </div>

            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              disabled={saving}
              className="h-4 w-4 accent-[#2E7D32]"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2E7D32] py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Service"
                  : "Save Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServiceManagement() {
  const [services, setServices] = useState([]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] =
    useState(false);
  const [editTarget, setEditTarget] =
    useState(null);
  const [modalError, setModalError] =
    useState("");
  const [saving, setSaving] = useState(false);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [deleting, setDeleting] =
    useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getAdminServices({
        page: 1,
        limit: 100,
      });

      const serviceList =
        extractServices(response);

      setServices(
        serviceList.map((service) =>
          normalizeService(service)
        )
      );
    } catch (error) {
      setServices([]);

      setPageError(
        getErrorMessage(
          error,
          "Unable to load services from the server."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const matchesQuery =
        !normalizedQuery ||
        service.name
          .toLowerCase()
          .includes(normalizedQuery) ||
        service.category
          .toLowerCase()
          .includes(normalizedQuery) ||
        service.description
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" &&
          service.active) ||
        (statusFilter === "Inactive" &&
          !service.active);

      return matchesQuery && matchesStatus;
    });
  }, [services, query, statusFilter]);

  const activeCount = useMemo(
    () =>
      services.filter(
        (service) => service.active
      ).length,
    [services]
  );

  const inactiveCount =
    services.length - activeCount;

  const openAddModal = () => {
    setEditTarget(null);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditTarget(service);
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditTarget(null);
    setModalError("");
  };

  const saveService = async (payload) => {
    setSaving(true);
    setModalError("");

    try {
      if (editTarget?.id !== undefined) {
        const response =
          await updateAdminService(
            editTarget.id,
            payload
          );

        const responseService =
          extractService(response);

        const updatedService =
          normalizeService({
            ...editTarget,
            ...payload,

            ...(responseService &&
            typeof responseService === "object"
              ? responseService
              : {}),

            id:
              responseService?.id ??
              responseService?._id ??
              editTarget.id,
          });

        setServices((currentServices) =>
          currentServices.map((service) =>
            service.id === editTarget.id
              ? updatedService
              : service
          )
        );
      } else {
        const response =
          await createAdminService(payload);

        const responseService =
          extractService(response);

        const createdService =
          normalizeService({
            ...payload,

            ...(responseService &&
            typeof responseService === "object"
              ? responseService
              : {}),

            id:
              responseService?.id ??
              responseService?._id ??
              Date.now(),
          });

        setServices((currentServices) => [
          createdService,
          ...currentServices,
        ]);
      }

      setModalOpen(false);
      setEditTarget(null);
    } catch (error) {
      setModalError(
        getErrorMessage(
          error,
          editTarget
            ? "Unable to update the service."
            : "Unable to create the service."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceStatus = async (
    service
  ) => {
    if (
      service.id === undefined ||
      statusUpdatingId !== null
    ) {
      return;
    }

    const nextActive = !service.active;

    setStatusUpdatingId(service.id);
    setPageError("");

    try {
      const response =
        await updateAdminService(service.id, {
          is_active: nextActive,
        });

      const responseService =
        extractService(response);

      const updatedService =
        normalizeService({
          ...service,

          ...(responseService &&
          typeof responseService === "object"
            ? responseService
            : {}),

          id:
            responseService?.id ??
            responseService?._id ??
            service.id,

          is_active: nextActive,
          active: nextActive,
        });

      setServices((currentServices) =>
        currentServices.map(
          (currentService) =>
            currentService.id === service.id
              ? updatedService
              : currentService
        )
      );
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to update the service status."
        )
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (
      !deleteTarget ||
      deleteTarget.id === undefined
    ) {
      return;
    }

    setDeleting(true);
    setPageError("");

    try {
      await deleteAdminService(
        deleteTarget.id
      );

      setServices((currentServices) =>
        currentServices.filter(
          (service) =>
            service.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to delete the service."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Inter']">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
              Hoku Health Care
            </p>

            <h1 className="font-['Poppins'] text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
              Service Management
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Add, edit, and manage healthcare
              services on the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20]"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>

        {pageError && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{pageError}</span>
            </div>

            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
              className="rounded p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Total Services
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-[#1A1A2E]">
              {services.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Active
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-[#2E7D32]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Inactive
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-[#DC2626]">
              {inactiveCount}
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search services..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            />
          </div>

          <div className="relative sm:w-48">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>

          <button
            type="button"
            onClick={loadServices}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-[#2E7D32]" />

              <p className="text-sm font-medium text-[#1A1A2E]">
                Loading services...
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
                <HeartPulse className="h-6 w-6 text-[#6B7280]" />
              </div>

              <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
                No services found
              </h3>

              <p className="mt-1 max-w-xs text-sm text-[#6B7280]">
                Add a service or try a different
                search and status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-[#6B7280]">
                    <th className="py-3 font-medium">
                      Service
                    </th>

                    <th className="py-3 font-medium">
                      Category
                    </th>

                    <th className="py-3 font-medium">
                      Duration
                    </th>

                    <th className="py-3 font-medium">
                      Price
                    </th>

                    <th className="py-3 font-medium">
                      Status
                    </th>

                    <th className="py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.map(
                    (service) => {
                      const updatingStatus =
                        statusUpdatingId ===
                        service.id;

                      return (
                        <tr
                          key={service.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-[#F5F5F5]/60"
                        >
                          <td className="max-w-[300px] py-3">
                            <div className="flex items-start gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2E7D32]/10 text-[#2E7D32]">
                                <HeartPulse className="h-5 w-5" />
                              </span>

                              <div>
                                <p className="font-medium text-[#1A1A2E]">
                                  {service.name}
                                </p>

                                <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280]">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 text-[#6B7280]">
                            {service.category}
                          </td>

                          <td className="py-3 text-[#6B7280]">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {service.duration
                                ? `${service.duration} min`
                                : "Not set"}
                            </div>
                          </td>

                          <td className="py-3 text-[#6B7280]">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                {formatPrice(
                                  service.price
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() =>
                                toggleServiceStatus(
                                  service
                                )
                              }
                              disabled={
                                updatingStatus
                              }
                              className={`relative h-6 w-11 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                service.active
                                  ? "bg-[#2E7D32]"
                                  : "bg-gray-300"
                              }`}
                              aria-label={`Mark ${service.name} as ${
                                service.active
                                  ? "inactive"
                                  : "active"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white transition ${
                                  service.active
                                    ? "left-5"
                                    : "left-0.5"
                                }`}
                              >
                                {updatingStatus && (
                                  <LoaderCircle className="h-3 w-3 animate-spin text-[#2E7D32]" />
                                )}
                              </span>
                            </button>
                          </td>

                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    service
                                  )
                                }
                                className="rounded-lg p-2 text-[#1565C0] hover:bg-[#1565C0]/10"
                                aria-label={`Edit ${service.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget(
                                    service
                                  )
                                }
                                className="rounded-lg p-2 text-[#DC2626] hover:bg-red-50"
                                aria-label={`Delete ${service.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ServiceModal
        open={modalOpen}
        service={editTarget}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSave={saveService}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-[#DC2626]" />
            </div>

            <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
              Delete {deleteTarget.name}?
            </h3>

            <p className="mt-1 text-sm text-[#6B7280]">
              This service will be permanently
              removed from the platform.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#DC2626] py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}