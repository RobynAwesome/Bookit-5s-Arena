'use client';

import { motion } from 'framer-motion';

/**
 * AnimatedTitle — bold, shadowed, animated page titles with advanced effects.
 * Used across ALL pages for consistent, eye-catching headings.
 *
 * Props:
 *  - text: string (plain text) or array of { text, highlight?: boolean } for multi-color
 *  - subtitle?: string
 *  - icon?: React element
 *  - size?: 'sm' | 'md' | 'lg' | 'xl' (default 'lg')
 *  - align?: 'left' | 'center' (default 'left')
 */
const sizes = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
};

const AnimatedTitle = ({ text, subtitle, icon, size = 'lg', align = 'left' }) => {
  const parts = typeof text === 'string'
    ? [{ text, highlight: false }]
    : text;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -90,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
        mass: 0.8,
      },
    },
  };

  const glowVariants = {
    initial: { textShadow: '0 0 0px transparent' },
    animate: {
      textShadow: [
        '0 0 10px rgba(34,197,94,0)',
        '0 0 30px rgba(34,197,94,0.4)',
        '0 0 60px rgba(34,197,94,0.2)',
        '0 0 10px rgba(34,197,94,0)',
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const underlineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className={`mb-8 ${align === 'center' ? 'text-center' : ''}`}>
      {/* Icon */}
      {icon && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 150 }}
          className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${align === 'center' ? 'mx-auto' : ''}`}
          style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}
        >
          <span className="text-white text-2xl">{icon}</span>
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        className={`${sizes[size]} uppercase font-black leading-tight`}
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          letterSpacing: '4px',
          perspective: '1000px',
          textShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 40px rgba(34,197,94,0.15)',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {parts.map((part, pi) => (
          <motion.span
            key={pi}
            variants={part.highlight ? glowVariants : {}}
            initial={part.highlight ? 'initial' : undefined}
            animate={part.highlight ? 'animate' : undefined}
            style={{ display: 'inline' }}
          >
            {part.text.split('').map((char, ci) => (
              <motion.span
                key={`${pi}-${ci}`}
                variants={letterVariants}
                className={part.highlight ? 'text-green-500' : 'text-white'}
                style={{
                  display: 'inline-block',
                  whiteSpace: char === ' ' ? 'pre' : undefined,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.span>
        ))}
      </motion.h1>

      {/* Animated underline */}
      <motion.div
        variants={underlineVariants}
        initial="hidden"
        animate="visible"
        className={`mt-3 h-1.5 w-20 rounded-full ${align === 'center' ? 'mx-auto' : ''}`}
        style={{
          background: 'linear-gradient(90deg, #15803d, #22c55e, #15803d)',
          transformOrigin: align === 'center' ? 'center' : 'left',
          boxShadow: '0 0 20px rgba(34,197,94,0.4)',
        }}
      />

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          className="text-gray-400 text-sm mt-3 max-w-xl"
          style={align === 'center' ? { margin: '12px auto 0' } : {}}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedTitle;
