'use client';

import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const CONTACT_CARDS = [
  {
    icon: <FaPhone className="text-green-400 text-3xl" />,
    label: 'Phone',
    main: '063 782 0245',
    sub: 'Mashoto',
    href: 'tel:+27637820245',
    hoverBorder: '#4ade80',
  },
  {
    icon: <FaEnvelope className="text-green-400 text-3xl" />,
    label: 'Email',
    main: 'fivearena@gmail.com',
    sub: 'We reply within 24hrs',
    href: 'mailto:fivearena@gmail.com',
    hoverBorder: '#4ade80',
  },
  {
    icon: <FaWhatsapp className="text-green-400 text-3xl" />,
    label: 'WhatsApp',
    main: '063 782 0245',
    sub: 'Instant response',
    href: 'https://wa.me/27637820245',
    hoverBorder: '#25D366',
    highlight: true,
  },
];


export default function ContactSection() {
  return (
    <section className="py-20 bg-black text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-green-400 font-bold tracking-widest uppercase text-sm mb-2">
            We&apos;d love to hear from you
          </p>
          <h2
            className="font-black uppercase"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontFamily: 'Impact, Arial Black, sans-serif',
            }}
          >
            GET IN TOUCH
          </h2>
        </motion.div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {CONTACT_CARDS.map((c, i) => (
            <motion.a
              key={i}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`flex flex-col items-center gap-3 p-8 border transition-all ${
                c.highlight ? 'border-green-900 bg-green-950/20' : 'border-gray-800'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{
                borderColor: c.hoverBorder,
                y: -4,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {c.icon}
              </motion.div>
              <span className="text-gray-400 text-xs uppercase tracking-widest">{c.label}</span>
              <span className="font-black text-lg">{c.main}</span>
              <span className="text-gray-500 text-sm">{c.sub}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
