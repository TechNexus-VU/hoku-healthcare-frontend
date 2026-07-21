import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiGlobe,
  FiMapPin,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

import Input from "../../components/doctor/Input";
import Button from "../../components/doctor/Button";

import { useAuth } from "@/context/AuthContext";

import {
  extractDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
} from "@/services/doctorProfileApi";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  specialty: "",
  qualification: "",
  experience: "",
  fee: "",
  biography: "",
  languages: "",
  hospital: "",
  address: "",
};

function getErrorMessage(
  error,
  fallback = "Unable to process Doctor profile."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeLanguages(value) {
  if (Array.isArray(value)) {
    return value
      .map((language) => String(language).trim())
      .filter(Boolean)
      .join(", ");
  }

  return String(value || "");
}

function normalizeProfile(profile = {}) {
  return {
    name:
      profile.full_name ||
      profile.fullName ||
      profile.name ||
      "",

    email: profile.email || "",

    phone:
      profile.phone ||
      profile.phone_number ||
      profile.phoneNumber ||
      "",

    specialty:
      profile.specialty ||
      profile.specialization ||
      "",

    qualification:
      profile.qualification ||
      profile.qualifications ||
      "",

    experience: String(
      profile.experience_years ??
        profile.experienceYears ??
        profile.experience ??
        ""
    ),

    fee: String(
      profile.consultation_fee ??
        profile.consultationFee ??
        profile.fee ??
        ""
    ),

    biography:
      profile.biography ||
      profile.bio ||
      "",

    languages: normalizeLanguages(
      profile.languages
    ),

    hospital:
      profile.hospital ||
      profile.clinic_name ||
      profile.clinicName ||
      "",

    address:
      profile.address ||
      profile.clinic_address ||
      profile.clinicAddress ||
      "",
  };
}

function getProfileImage(profile = {}) {
  return (
    profile.avatar_url ||
    profile.avatarUrl ||
    profile.avatar ||
    profile.profile_image ||
    profile.profileImage ||
    ""
  );
}

function getInitials(name) {
  const words = String(name || "Doctor")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "D";
  }

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return `${words[0].charAt(0)}${words[
    words.length - 1
  ].charAt(0)}`.toUpperCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function profilesMatch(first, second) {
  return JSON.stringify(first) ===
    JSON.stringify(second);
}

export default function Profile() {
  const fileInputRef = useRef(null);

  const { updateUser } = useAuth();

  const [form, setForm] =
    useState(EMPTY_PROFILE);

  const [
    originalProfile,
    setOriginalProfile,
  ] = useState(EMPTY_PROFILE);

  const [
    profileImage,
    setProfileImage,
  ] = useState("");

  const [
    originalProfileImage,
    setOriginalProfileImage,
  ] = useState("");

  const [imageRemoved, setImageRemoved] =
    useState(false);

  const [imageError, setImageError] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadProfile =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getDoctorProfile();

        const extractedProfile =
          extractDoctorProfile(response);

        const profile =
          extractedProfile &&
          typeof extractedProfile === "object"
            ? extractedProfile
            : {};

        const normalizedProfile =
          normalizeProfile(profile);

        const image =
          getProfileImage(profile);

        setForm(normalizedProfile);

        setOriginalProfile(
          normalizedProfile
        );

        setProfileImage(image);
        setOriginalProfileImage(image);

        setImageRemoved(false);
        setImageError(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Unable to load Doctor profile."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const hasFormChanges = useMemo(
    () =>
      !profilesMatch(
        form,
        originalProfile
      ),
    [form, originalProfile]
  );

  const hasImageChanges =
    profileImage !==
      originalProfileImage ||
    imageRemoved;

  const hasUnsavedChanges =
    hasFormChanges || hasImageChanges;

  const doctorInitials = getInitials(
    form.name
  );

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    if (
      name === "biography" &&
      value.length > 500
    ) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleImageSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maximumSize =
      2 * 1024 * 1024;

    if (
      !allowedTypes.includes(file.type)
    ) {
      toast.error(
        "Select a JPG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > maximumSize) {
      toast.error(
        "Profile image must be smaller than 2 MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData =
        typeof reader.result === "string"
          ? reader.result
          : "";

      if (!imageData) {
        toast.error(
          "Unable to preview the selected image."
        );

        return;
      }

      setProfileImage(imageData);
      setImageRemoved(false);
      setImageError(false);
    };

    reader.onerror = () => {
      toast.error(
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    setImageRemoved(true);
    setImageError(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(
        "Enter your full name."
      );

      return false;
    }

    if (!form.email.trim()) {
      toast.error(
        "Enter your email address."
      );

      return false;
    }

    if (
      !isValidEmail(
        form.email.trim()
      )
    ) {
      toast.error(
        "Enter a valid email address."
      );

      return false;
    }

    if (!form.phone.trim()) {
      toast.error(
        "Enter your phone number."
      );

      return false;
    }

    if (!form.specialty.trim()) {
      toast.error(
        "Enter your medical specialty."
      );

      return false;
    }

    if (!form.qualification.trim()) {
      toast.error(
        "Enter your qualification."
      );

      return false;
    }

    const experience = Number(
      form.experience || 0
    );

    const fee = Number(
      form.fee || 0
    );

    if (
      !Number.isFinite(experience) ||
      experience < 0
    ) {
      toast.error(
        "Experience must be zero or a positive number."
      );

      return false;
    }

    if (
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      toast.error(
        "Consultation fee must be zero or a positive number."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      full_name: form.name.trim(),

      email: form.email
        .trim()
        .toLowerCase(),

      phone: form.phone.trim(),

      specialty:
        form.specialty.trim(),

      qualification:
        form.qualification.trim(),

      experience_years:
        Number(form.experience) || 0,

      consultation_fee:
        Number(form.fee) || 0,

      biography:
        form.biography.trim(),

      languages: form.languages
        .split(",")
        .map((language) =>
          language.trim()
        )
        .filter(Boolean),

      hospital:
        form.hospital.trim(),

      address:
        form.address.trim(),

      avatar_url: imageRemoved
        ? ""
        : profileImage,
    };

    try {
      const response =
        await updateDoctorProfile(
          payload
        );

      const extractedProfile =
        extractDoctorProfile(
          response
        );

      const responseProfile =
        extractedProfile &&
        typeof extractedProfile ===
          "object"
          ? extractedProfile
          : {};

      const mergedProfile = {
        ...payload,
        ...responseProfile,
      };

      const normalizedProfile =
        normalizeProfile(
          mergedProfile
        );

      const responseImage =
        getProfileImage(
          responseProfile
        );

      const updatedImage =
        imageRemoved
          ? ""
          : responseImage ||
            profileImage;

      setForm(normalizedProfile);

      setOriginalProfile(
        normalizedProfile
      );

      setProfileImage(updatedImage);

      setOriginalProfileImage(
        updatedImage
      );

      setImageRemoved(false);
      setImageError(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      updateUser?.({
        name: normalizedProfile.name,

        full_name:
          normalizedProfile.name,

        email:
          normalizedProfile.email,

        phone:
          normalizedProfile.phone,

        specialty:
          normalizedProfile.specialty,

        avatar_url: updatedImage,
        avatar: updatedImage,
      });

      toast.success(
        "Doctor profile updated successfully."
      );
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        "Unable to update your profile."
      );

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!hasUnsavedChanges) {
      toast.info(
        "There are no unsaved changes."
      );

      return;
    }

    setForm(originalProfile);

    setProfileImage(
      originalProfileImage
    );

    setImageRemoved(false);
    setImageError(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.info(
      "Unsaved changes were discarded."
    );
  };

  if (loading) {
    return <ProfileLoading />;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="min-w-0 space-y-5 sm:space-y-6"
    >
      {/* Page header */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)] sm:text-sm">
              Doctor Portal
            </p>

            <h1 className="mt-1 font-heading text-2xl font-bold text-[var(--heading)] sm:text-3xl">
              Doctor Profile
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Manage your personal,
              professional, consultation,
              and clinic information.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {hasUnsavedChanges && (
              <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700">
                <FiAlertCircle size={16} />

                Unsaved changes
              </span>
            )}

            <button
              type="button"
              onClick={loadProfile}
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <FiRefreshCw size={17} />

              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-[var(--danger)]">
          <FiAlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0">
            <p className="font-semibold">
              Profile could not be processed
            </p>

            <p className="mt-1 break-words leading-6">
              {error}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="min-w-0"
      >
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* Profile summary */}
          <aside className="min-w-0 xl:sticky xl:top-[96px]">
            <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
              <div className="bg-gradient-to-br from-[var(--primary)] to-[#4f8ee8] px-5 pb-16 pt-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/75">
                  Professional Profile
                </p>
              </div>

              <div className="-mt-12 px-5 pb-5">
                <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
                  {profileImage &&
                  !imageError ? (
                    <img
                      src={profileImage}
                      alt={
                        form.name ||
                        "Doctor profile"
                      }
                      onError={() =>
                        setImageError(true)
                      }
                      className="h-full w-full rounded-[var(--radius-xl)] border-4 border-white object-cover shadow-[var(--shadow-card)]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-xl)] border-4 border-white bg-[var(--primary-light)] font-heading text-3xl font-bold text-[var(--primary)] shadow-[var(--shadow-card)]">
                      {doctorInitials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={saving}
                    aria-label="Choose profile image"
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border-2 border-white bg-[var(--primary)] text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiCamera size={17} />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageSelect
                  }
                  disabled={saving}
                  className="hidden"
                />

                <div className="mt-6 text-center">
                  <h2 className="truncate font-heading text-lg font-bold text-[var(--heading)]">
                    {form.name ||
                      "Doctor Name"}
                  </h2>

                  <p className="mt-1 truncate text-sm text-[var(--body)]">
                    {form.specialty ||
                      "Medical Specialist"}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--secondary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--secondary-hover)]">
                    <FiCheckCircle size={14} />

                    Doctor account active
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={saving}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiCamera size={16} />

                    Upload Photo
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      onClick={
                        handleRemoveImage
                      }
                      disabled={saving}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-red-200 bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--danger)] transition-all duration-300 hover:border-[var(--danger)] hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiTrash2 size={16} />

                      Remove Photo
                    </button>
                  )}
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
                  JPG, PNG, or WebP.
                  Maximum file size: 2 MB.
                </p>
              </div>
            </section>
          </aside>

          {/* Profile fields */}
          <div className="min-w-0 space-y-6">
            <ProfileSection
              icon={FiUser}
              eyebrow="Account Details"
              title="Personal Information"
              description="Basic contact and account information."
            >
              <div className="grid min-w-0 gap-5 md:grid-cols-2">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  disabled={saving}
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={saving}
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                  disabled={saving}
                />

                <Input
                  label="Languages"
                  name="languages"
                  type="text"
                  placeholder="English, Urdu"
                  value={form.languages}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>
            </ProfileSection>

            <ProfileSection
              icon={FiGlobe}
              eyebrow="Clinical Background"
              title="Professional Information"
              description="Your specialty, qualifications, experience, and consultation information."
            >
              <div className="grid min-w-0 gap-5 md:grid-cols-2">
                <Input
                  label="Medical Specialty"
                  name="specialty"
                  type="text"
                  placeholder="Cardiology"
                  value={form.specialty}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />

                <Input
                  label="Qualification"
                  name="qualification"
                  type="text"
                  placeholder="MBBS, FCPS"
                  value={form.qualification}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />

                <Input
                  label="Experience (Years)"
                  name="experience"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="12"
                  value={form.experience}
                  onChange={handleChange}
                  disabled={saving}
                />

                <Input
                  label="Consultation Fee"
                  name="fee"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="180"
                  value={form.fee}
                  onChange={handleChange}
                  disabled={saving}
                />

                <label className="block min-w-0 md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-[var(--heading)]">
                    Professional Biography
                  </span>

                  <textarea
                    name="biography"
                    value={form.biography}
                    onChange={handleChange}
                    disabled={saving}
                    maxLength={500}
                    placeholder="Describe your professional background and approach to patient care."
                    className="min-h-36 w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm leading-6 text-[var(--heading)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:bg-[var(--section)] disabled:text-[var(--muted)]"
                  />

                  <div className="mt-2 flex items-center justify-between gap-4 text-xs">
                    <span className="text-[var(--muted)]">
                      Maximum 500 characters
                    </span>

                    <span
                      className={
                        form.biography.length >
                        450
                          ? "font-semibold text-[var(--warning)]"
                          : "text-[var(--muted)]"
                      }
                    >
                      {form.biography.length}
                      /500
                    </span>
                  </div>
                </label>
              </div>
            </ProfileSection>

            <ProfileSection
              icon={FiMapPin}
              eyebrow="Practice Location"
              title="Clinic Information"
              description="Hospital, clinic, and consultation-location information."
            >
              <div className="grid min-w-0 gap-5 md:grid-cols-2">
                <Input
                  label="Hospital or Clinic"
                  name="hospital"
                  type="text"
                  placeholder="Enter hospital or clinic name"
                  value={form.hospital}
                  onChange={handleChange}
                  disabled={saving}
                />

                <Input
                  label="Clinic Address"
                  name="address"
                  type="text"
                  placeholder="Enter complete clinic address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>
            </ProfileSection>

            {/* Form actions */}
            <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold text-[var(--heading)]">
                    Save profile information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--body)]">
                    Changes will update your
                    Doctor Portal profile and
                    top navigation.
                  </p>
                </div>

                <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={
                      saving ||
                      !hasUnsavedChanges
                    }
                    className="w-full sm:min-w-32"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      saving ||
                      !hasUnsavedChanges
                    }
                    className="w-full sm:min-w-40"
                  >
                    <span className="inline-flex items-center gap-2">
                      {saving ? (
                        <FiRefreshCw
                          className="animate-spin"
                          size={16}
                        />
                      ) : (
                        <FiSave size={16} />
                      )}

                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </span>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

function ProfileSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="min-w-0 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] text-[var(--primary)]">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
            {eyebrow}
          </p>

          <h2 className="mt-0.5 font-heading text-lg font-bold text-[var(--heading)]">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--body)]">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function ProfileLoading() {
  return (
    <div
      className="flex min-h-[420px] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-8 py-7 text-center shadow-[var(--shadow-soft)]">
        <FiRefreshCw className="mx-auto animate-spin text-3xl text-[var(--primary)]" />

        <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
          Loading Doctor profile
        </p>

        <p className="mt-1 text-xs text-[var(--muted)]">
          Please wait while your profile
          information is prepared.
        </p>
      </div>
    </div>
  );
}