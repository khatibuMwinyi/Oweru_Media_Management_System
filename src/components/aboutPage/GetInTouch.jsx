import { useState } from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { contactService } from "../../services/api";

export default function GetInTouch() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
      setSubmitMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      const response = await contactService.submit(formData);
      setSubmitStatus("success");
      setSubmitMessage(
        response.data?.message ||
          "Thank you for your message! We'll get back to you soon."
      );
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      if (error.response?.data?.message) {
        setSubmitMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0]?.[0];
        setSubmitMessage(firstError || "Failed to send message. Please try again.");
        setErrors(validationErrors);
      } else {
        setSubmitMessage(
          "Failed to send message. Please check your connection and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#020617] py-15 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold  text-white">
            Get In Touch
          </h2>
          <p className="mt-3 text-sm tracking-widest text-slate-300">
            We'd love to hear from you
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* FORM */}
          <div className="bg-[#0f172a] rounded-xl p-8 border border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  required
                />
              </div>

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                required
              />

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full bg-transparent border rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none resize-none ${
                    errors.message
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-700 focus:border-blue-600"
                  }`}
                  placeholder="Enter your message here..."
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message}</p>
                )}
              </div>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="p-3 rounded-md bg-green-900/30 border border-green-700 text-green-300 text-sm">
                  {submitMessage}
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-3 rounded-md bg-red-900/30 border border-red-700 text-red-300 text-sm">
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 transition text-white py-3 rounded-md tracking-widest"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* INFO */}
          <div className="bg-[#0f172a] rounded-xl p-8 border border-slate-800 space-y-10">
            <Info
              icon={<MapPin />}
              title="Visit Our Office"
              lines={["Tancot House Posta", "Dar es Salaam, Tanzania"]}
            />

            <Info
              icon={<Phone />}
              title="Call Us"
              lines={["+255 714 859 934", "Mon–Fri, 8AM–5PM"]}
            />

            <Info
              icon={<Mail />}
              title="Email Us"
              lines={["info@oweru.com", "director@oweru.com"]}
              highlight
            />
            <Info
              icon={<Globe />}
              title="Visit Our Websites"
              lines={["www.mjengochallenge.com", "www.oweru.com"]}
              highlight
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Components ---------- */

function Input({ label, name, type = "text", value, onChange, error, required }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-transparent border rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-700 focus:border-blue-600"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Info({ icon, title, lines, highlight }) {
  return (
    <div className="flex gap-4">
      <div className="w-11 h-11 rounded-md bg-blue-700 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-2">
          {title}
        </h4>
        {lines.map((line, i) => (
          <p
            key={i}
            className={
              highlight ? "text-blue-400 text-sm" : "text-slate-300 text-sm"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
