"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", projectType: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-400/18 blur-3xl animate-float" />
          <div className="absolute -top-12 right-[-140px] h-[520px] w-[520px] rounded-full bg-blue-500/14 blur-3xl animate-float-slow" />
        </div>
        <div className="container-page">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-slate-900">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl">
            Have questions? We&apos;d love to hear from you. Send us a message and
            we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="card p-8 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="projectType"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition"
              >
                <option value="">Select a project type...</option>
                <option value="business">Business Website</option>
                <option value="ecommerce">E-Commerce Store</option>
                <option value="portfolio">Portfolio</option>
                <option value="blog">Blog/Content Site</option>
                <option value="custom">Custom Project</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition"
                placeholder="Tell us about your project..."
              ></textarea>
            </div>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                ✓ Thank you! We&apos;ve received your message and will get back to
                you soon.
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                ✗ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* Contact Info */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-hover p-8 text-center">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                ✉
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">contact@agency.com</p>
            </div>
            <div className="card card-hover p-8 text-center">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                📱
              </div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">(555) 123-4567</p>
            </div>
            <div className="card card-hover p-8 text-center">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                💬
              </div>
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p className="text-gray-600">24-48 hours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
