"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-500 font-black uppercase tracking-[0.3em] text-xs mb-4"
          >
            Get In Touch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-black uppercase leading-none mb-6"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
            }}
          >
            Contact <span className="text-green-500">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Have a question about our courts, tournaments, or leagues? Send us a message and we'll get back to you within 24 hours.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="space-y-6">
              {[
                {
                  icon: FaPhone,
                  label: "Call Us",
                  value: "+27 63 782 0245",
                  href: "tel:+27637820245",
                  color: "#22c55e",
                },
                {
                  icon: FaWhatsapp,
                  label: "WhatsApp",
                  value: "Message Support",
                  href: "https://wa.me/27637820245",
                  color: "#25D366",
                },
                {
                  icon: FaEnvelope,
                  label: "Email",
                  value: "fivearena@gmail.com",
                  href: "mailto:fivearena@gmail.com",
                  color: "#3b82f6",
                },
                {
                  icon: FaMapMarkerAlt,
                  label: "Location",
                  value: "Hellenic Football Club, Milnerton, CZ",
                  href: "https://maps.google.com/?q=Hellenic+Football+Club+Milnerton",
                  color: "#ef4444",
                },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}33` }}
                  >
                    <item.icon style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">
                      {item.label}
                    </p>
                    <p className="text-white font-bold group-hover:text-green-400 transition-colors">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-linear-to-br from-green-900/20 to-gray-900 border border-green-500/20">
              <h3 className="text-white font-bold mb-2">Operating Hours</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex justify-between">
                  <span>Monday - Sunday</span>
                  <span className="text-green-400">10:00 - 22:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Public Holidays</span>
                  <span className="text-green-400">10:00 - 18:00</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-3xl p-8"
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-900/40">
                    <FaCheckCircle className="text-white text-3xl" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Message Sent!</h2>
                  <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                    Thanks for reaching out! A member of our team will contact you shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-8 py-3 rounded-xl bg-gray-800 text-white font-bold uppercase tracking-widest text-sm border border-gray-700 hover:bg-gray-700 transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-1">Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-1">Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-1">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all"
                    >
                      <option>General Inquiry</option>
                      <option>Tournament Registration</option>
                      <option>League Information</option>
                      <option>Events & Birthdays</option>
                      <option>Booking Issues</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-1">Message</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-green-900/40 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaPaperPlane size={14} /> Send Message
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
