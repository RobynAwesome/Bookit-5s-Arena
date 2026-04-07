'use client';

import { FaRocket, FaMobileAlt, FaBolt } from 'react-icons/fa';
import BlogReader from '@/components/BlogReader';

export default function HowWeBuiltThisPage() {
  return (
    <BlogReader 
      title="HOW WE BUILT THE 5S ARENA PLATFORM"
      author="Engineering Team"
      date="14 April 2026"
    >
      <p className="lead text-xl font-bold mb-8">
        When we set out to build the digital home for the largest 5-a-side World Cup tournament in Cape Town, we knew a standard WordPress site wouldn&apos;t cut it. We needed an architecture capable of handling live score updates, heavy animation, and a massive influx of team registrations.
      </p>

      <h2 className="flex items-center gap-3">
        <FaRocket className="text-green-500" /> The Tech Stack
      </h2>
      <p>
        Our core mission was performance and stability. We selected <strong>Next.js 15</strong> utilizing the App Router to build a fully robust, Server-Side Rendered (SSR) infrastructure combined with aggressive Static Site Generation (SSG). 
      </p>
      <ul>
        <li><strong>Frontend Framework:</strong> React 19 + Next.js</li>
        <li><strong>Styling:</strong> Tailwind CSS V4 for blazing fast utility-first styling.</li>
        <li><strong>Motion & Animation:</strong> Framer Motion 12. We extensively used tween-based transitions to prevent browser layout thrashing during heavy DOM manipulations.</li>
        <li><strong>Database:</strong> MongoDB via Mongoose for rapid prototyping and flexible document storage of Tournament Teams.</li>
      </ul>

      <h2 className="flex items-center gap-3">
        <FaBolt className="text-yellow-500" /> Overcoming the Framer Motion &quot;BoxShadow&quot; Crash
      </h2>
      <p>
        Early in development, we hit a critical wall. The application would completely white-screen crash when navigating between pages with heavy animations. The culprit? Applying <code>spring</code> physics transitions to multi-keyframe <code>boxShadow</code> pulses. 
      </p>
      <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 my-6 text-sm font-mono leading-relaxed">
        <span className="text-red-400 block mb-2">{`// The bad way (causes crash):`}</span>
        <span className="text-gray-300 block">
          transition: &#123; type: &quot;spring&quot;, stiffness: 300 &#125;
        </span>
        <div className="w-full h-px bg-white/10 my-4" />
        <span className="text-green-400 block mb-2">{`// The safe way:`}</span>
        <span className="text-gray-300 block">
          transition: &#123; duration: 2, ease: &quot;easeInOut&quot;, repeat: Infinity &#125;
        </span>
      </div>
      <p>
        By switching exclusively to duration-based tweens for complex properties, we instantly solved the hydration crashes and smoothed out the UX.
      </p>

      <h2 className="flex items-center gap-3">
        <FaMobileAlt className="text-purple-500" /> Mobile-First Real-time Architecture
      </h2>
      <p>
        The tournament dashboard had to look stunning on mobile while delivering real-time stats. We implemented a lightweight polling mechanism leveraging Next.js Route Handlers (<code>/api/tournament/stats</code>) and edge execution to deliver lightning-fast JSON payloads. This guarantees that when a team locks in their World Cup spot, the capacity meters update globally within seconds.
      </p>
    </BlogReader>
  );
}
