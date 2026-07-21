import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
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

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

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

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StatusToggle({
  service,
  updating,
  onToggle,
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(service)}
      disabled={updating}
      aria-label={`Mark ${service.name} as ${
        service.active
          ? "inactive"
          : "active"
      }`}
      aria-pressed={service.active}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 ${
        service.active
          ? "bg-primary"
          : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
          service.active
            ? "translate-x-5"
            : "translate-x-0.5"
        }`}
      >
        {updating && (
          <LoaderCircle className="h-3 w-3 animate-spin text-primary" />
        )}
      </span>
    </button>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
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
  const [form, setForm] =
    useState(EMPTY_FORM);

  const [
    validationError,
    setValidationError,
  ] = useState("");

  const isEditing = Boolean(service);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError("");

    if (service) {
      setForm({
        name: service.name || "",
        category: service.category || "",
        description:
          service.description || "",
        duration: String(
          service.duration ?? ""
        ),
        price: String(
          service.price ?? ""
        ),
        active: Boolean(service.active),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, service]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const name = form.name.trim();
    const category =
      form.category.trim();
    const description =
      form.description.trim();

    if (!name || !category) {
      setValidationError(
        "Service name and category are required."
      );

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

  const visibleError =
    validationError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Service details
            </p>

            <h2
              id="service-modal-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {isEditing
                ? "Edit service"
                : "Add new service"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update the selected service information."
                : "Create a healthcare service for the HOKU platform."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close service form"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
        >
          {visibleError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{visibleError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Service name"
              required
            >
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={saving}
                placeholder="Home Health Care"
                className={inputClassName}
                autoFocus
              />
            </FormField>

            <FormField
              label="Category"
              required
            >
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={saving}
                  className={`${inputClassName} appearance-none pr-10`}
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

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={saving}
              rows={4}
              placeholder="Describe this healthcare service..."
              className={`${inputClassName} resize-none`}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Duration (minutes)">
              <input
                type="number"
                name="duration"
                min="0"
                value={form.duration}
                onChange={handleChange}
                disabled={saving}
                placeholder="60"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Price (PKR)">
              <input
                type="number"
                name="price"
                min="0"
                value={form.price}
                onChange={handleChange}
                disabled={saving}
                placeholder="3000"
                className={inputClassName}
              />
            </FormField>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Active service
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Active services can be
                displayed and used across
                the platform.
              </p>
            </div>

            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              disabled={saving}
              className="h-4 w-4 shrink-0 accent-primary"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Update service"
                  : "Save service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  service,
  deleting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!service) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !deleting
      ) {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [service, deleting, onCancel]);

  if (!service) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-service-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-2xl sm:p-7">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>

        <h2
          id="delete-service-title"
          className="mt-5 text-xl font-bold text-slate-900"
        >
          Delete service?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          <span className="font-semibold text-slate-700">
            {service.name}
          </span>{" "}
          will be permanently removed.
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}

            {deleting
              ? "Deleting..."
              : "Delete service"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceMobileCard({
  service,
  updatingStatus,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartPulse className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {service.name}
            </h3>

            <p className="mt-1 text-xs font-medium text-primary">
              {service.category}
            </p>
          </div>
        </div>

        <StatusBadge
          active={service.active}
        />
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
        {service.description}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-xs text-slate-400">
            Duration
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <Clock3 className="h-4 w-4 text-primary" />

            {service.duration
              ? `${service.duration} min`
              : "Not set"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-xs text-slate-400">
            Price
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {formatPrice(service.price)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <StatusToggle
            service={service}
            updating={updatingStatus}
            onToggle={onToggleStatus}
          />

          <span className="text-xs font-medium text-slate-500">
            {service.active
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onEdit(service)
            }
            aria-label={`Edit ${service.name}`}
            className="rounded-xl border border-primary/15 bg-primary/5 p-2.5 text-primary transition hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(service)
            }
            aria-label={`Delete ${service.name}`}
            className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ServiceManagement() {
  const [services, setServices] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editTarget, setEditTarget] =
    useState(null);

  const [modalError, setModalError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [
    statusUpdatingId,
    setStatusUpdatingId,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const loadServices =
    useCallback(async () => {
      setLoading(true);
      setPageError("");

      try {
        const response =
          await getAdminServices({
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

  const filteredServices =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      return services.filter(
        (service) => {
          const matchesQuery =
            !normalizedQuery ||
            service.name
              .toLowerCase()
              .includes(
                normalizedQuery
              ) ||
            service.category
              .toLowerCase()
              .includes(
                normalizedQuery
              ) ||
            service.description
              .toLowerCase()
              .includes(
                normalizedQuery
              );

          const matchesStatus =
            statusFilter === "All" ||
            (statusFilter ===
              "Active" &&
              service.active) ||
            (statusFilter ===
              "Inactive" &&
              !service.active);

          return (
            matchesQuery &&
            matchesStatus
          );
        }
      );
    }, [
      services,
      query,
      statusFilter,
    ]);

  const activeCount = useMemo(
    () =>
      services.filter(
        (service) => service.active
      ).length,
    [services]
  );

  const inactiveCount =
    services.length - activeCount;

  const hasFilters =
    Boolean(query.trim()) ||
    statusFilter !== "All";

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

  const closeModal = useCallback(() => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditTarget(null);
    setModalError("");
  }, [saving]);

  const saveService = async (
    payload
  ) => {
    setSaving(true);
    setModalError("");

    try {
      if (
        editTarget?.id !== undefined
      ) {
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
            typeof responseService ===
              "object"
              ? responseService
              : {}),

            id:
              responseService?.id ??
              responseService?._id ??
              editTarget.id,
          });

        setServices(
          (currentServices) =>
            currentServices.map(
              (service) =>
                service.id ===
                editTarget.id
                  ? updatedService
                  : service
            )
        );
      } else {
        const response =
          await createAdminService(
            payload
          );

        const responseService =
          extractService(response);

        const createdService =
          normalizeService({
            ...payload,

            ...(responseService &&
            typeof responseService ===
              "object"
              ? responseService
              : {}),

            id:
              responseService?.id ??
              responseService?._id ??
              Date.now(),
          });

        setServices(
          (currentServices) => [
            createdService,
            ...currentServices,
          ]
        );
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

    const nextActive =
      !service.active;

    setStatusUpdatingId(service.id);
    setPageError("");

    try {
      const response =
        await updateAdminService(
          service.id,
          {
            is_active: nextActive,
          }
        );

      const responseService =
        extractService(response);

      const updatedService =
        normalizeService({
          ...service,

          ...(responseService &&
          typeof responseService ===
            "object"
            ? responseService
            : {}),

          id:
            responseService?.id ??
            responseService?._id ??
            service.id,

          is_active: nextActive,
          active: nextActive,
        });

      setServices(
        (currentServices) =>
          currentServices.map(
            (currentService) =>
              currentService.id ===
              service.id
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

      setServices(
        (currentServices) =>
          currentServices.filter(
            (service) =>
              service.id !==
              deleteTarget.id
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

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
  };

  return (
    <section className="space-y-6 font-['Inter']">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />

            Care services
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Service Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Create, update, and control
            the healthcare services
            available across the HOKU
            platform.
          </p>
        </div>

        <button
  type="button"
  onClick={openAddModal}
  style={{ backgroundColor: "#1E63C6" }}
  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primary/20 sm:w-auto"
>
  <Plus className="h-4 w-4" />
  Add service
</button>
      </header>

      {pageError && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{pageError}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setPageError("")
            }
            aria-label="Dismiss error"
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total services"
          value={services.length}
          icon={HeartPulse}
          iconClassName="bg-primary/10 text-primary"
        />

        <StatCard
          label="Active services"
          value={activeCount}
          icon={CheckCircle2}
          iconClassName="bg-secondary/20 text-lime-700"
        />

        <StatCard
          label="Inactive services"
          value={inactiveCount}
          icon={AlertCircle}
          iconClassName="bg-slate-100 text-slate-500"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search by service, category, or description..."
              className={`${inputClassName} pl-10`}
            />
          </div>

          <div className="relative lg:w-48">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className={`${inputClassName} appearance-none pr-10`}
            >
              <option value="All">
                All statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={loadServices}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredServices.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {services.length}
            </span>{" "}
            services
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-primary transition hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-16 text-center shadow-sm">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading services...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Fetching the latest service
            information.
          </p>
        </div>
      ) : filteredServices.length ===
        0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartPulse className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No services found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {hasFilters
              ? "Try changing your search term or status filter."
              : "Create your first healthcare service to get started."}
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddModal}
              style={{ backgroundColor: "#1E63C6" }}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" />

              Add service
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filteredServices.map(
              (service) => (
                <ServiceMobileCard
                  key={service.id}
                  service={service}
                  updatingStatus={
                    statusUpdatingId ===
                    service.id
                  }
                  onToggleStatus={
                    toggleServiceStatus
                  }
                  onEdit={
                    openEditModal
                  }
                  onDelete={
                    setDeleteTarget
                  }
                />
              )
            )}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-5 py-4">
                      Service
                    </th>

                    <th className="px-4 py-4">
                      Category
                    </th>

                    <th className="px-4 py-4">
                      Duration
                    </th>

                    <th className="px-4 py-4">
                      Price
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map(
                    (service) => {
                      const updatingStatus =
                        statusUpdatingId ===
                        service.id;

                      return (
                        <tr
                          key={service.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex max-w-md items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <HeartPulse className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-slate-900">
                                  {
                                    service.name
                                  }
                                </p>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {
                                    service.description
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                              {
                                service.category
                              }
                            </span>
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Clock3 className="h-4 w-4 text-slate-400" />

                              {service.duration
                                ? `${service.duration} min`
                                : "Not set"}
                            </div>
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-700">
                            {formatPrice(
                              service.price
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <StatusToggle
                                service={
                                  service
                                }
                                updating={
                                  updatingStatus
                                }
                                onToggle={
                                  toggleServiceStatus
                                }
                              />

                              <StatusBadge
                                active={
                                  service.active
                                }
                              />
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    service
                                  )
                                }
                                aria-label={`Edit ${service.name}`}
                                className="rounded-xl border border-primary/15 bg-primary/5 p-2.5 text-primary transition hover:bg-primary/10"
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
                                aria-label={`Delete ${service.name}`}
                                className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
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
          </div>
        </>
      )}

      <ServiceModal
        open={modalOpen}
        service={editTarget}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSave={saveService}
      />

      <DeleteModal
        service={deleteTarget}
        deleting={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </section>
  );
}