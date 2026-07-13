import { useState } from "react";
import { toast } from "react-toastify";

import contactImage from "@/assets/contactImage.png";

const GetInTouch = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    password: "",
    phone: "",
    service: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const services = [
    "Home Health",
    "Palliative Care",
    "Hospice Care",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.service
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      // Replace this section later with your API request.
      console.log("Submitted contact form:", formData);

      toast.success("Your message has been submitted successfully.");

      setFormData({
        firstName: "",
        secondName: "",
        email: "",
        password: "",
        phone: "",
        service: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Unable to submit your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute -bottom-20 right-0 h-40 w-[55%] -rotate-6 bg-[#1268AE]" />
      <div className="pointer-events-none absolute -bottom-8 right-0 h-7 w-[58%] -rotate-6 bg-[#9CCB39]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_45px_rgba(0,0,0,0.15)]">
          <div className="grid lg:grid-cols-2">
            {/* Left image */}
            <div className="relative min-h-[360px] sm:min-h-[450px] lg:min-h-[570px]">
              <img
                src={contactImage}
                alt="Healthcare professional assisting a patient online"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0A4777]/20 via-transparent to-transparent" />
            </div>

            {/* Right form */}
            <div className="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="w-full">
                <div className="mb-8">
                  <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#9CCB39]">
                    Hoku
                  </p>

                  <h2 className="text-3xl font-extrabold uppercase leading-tight text-[#1268AE] sm:text-4xl lg:text-[42px]">
                    Get In Touch
                  </h2>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-x-7 gap-y-7 sm:grid-cols-2">
                    <FormField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />

                    <FormField
                      label="Second Name"
                      name="secondName"
                      value={formData.secondName}
                      onChange={handleChange}
                    />

                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                    <FormField
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <FormField
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />

                    <div>
                      <label
                        htmlFor="service"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#222222]"
                      >
                        Service
                      </label>

                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        className="w-full border-0 border-b border-[#8A8A8A] bg-transparent px-0 pb-2 text-sm text-[#333333] outline-none transition-colors duration-300 focus:border-[#1268AE]"
                      >
                        <option value="">Select service</option>

                        {services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-7">
                    <label
                      htmlFor="message"
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#222222]"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full resize-none border-0 border-b border-[#8A8A8A] bg-transparent px-0 pb-2 text-sm text-[#333333] outline-none transition-colors duration-300 focus:border-[#1268AE]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-8 rounded-md bg-[#1268AE] px-7 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_rgba(18,104,174,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D568F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Now"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#222222]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border-0 border-b border-[#8A8A8A] bg-transparent px-0 pb-2 text-sm text-[#333333] outline-none transition-colors duration-300 focus:border-[#1268AE]"
      />
    </div>
  );
};

export default GetInTouch;