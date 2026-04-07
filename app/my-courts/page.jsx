'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaFutbol, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

  const MyCourtsPage = () => {
      const [courts, setCourts] = useState([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchCourts = async () => {
          const res = await fetch('/api/courts?mine=true');
          const data = await res.json();
          setCourts(data);
          setLoading(false);
        };
        fetchCourts();
      }, []);

      const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this court?')) return;
        await fetch(`/api/courts/${id}`, { method: 'DELETE' });
        setCourts((prev) => prev.filter((c) => c._id !== id));
      };

      if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;

      return (
  <div className="min-h-screen bg-gray-950 py-10 px-4">
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            My Courts
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your court listings</p>
        </div>
        <Link
          href="/courts/add"
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white uppercase tracking-widest hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
        >
          <FaPlus size={11} /> Add Court
        </Link>
      </motion.div>

      {courts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center shadow-xl"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 border border-gray-700 mb-6">
            <FaFutbol className="text-4xl text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg font-semibold mb-2">No courts yet</p>
          <p className="text-gray-600 text-sm mb-8">Add your first court to start taking bookings.</p>
          <Link
            href="/courts/add"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 20px rgba(34,197,94,0.35)' }}
          >
            <FaPlus size={11} /> Add Your First Court
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="visible"
        >
          {courts.map((court) => (
            <motion.div
              key={court._id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-lg hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-700">
                  <Image
                    src={`/images/courts/${court.image}`}
                    alt={court.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">{court.name}</h3>
                  <p className="text-xs text-gray-500">{court.address}</p>
                  <p className="text-xs text-gray-500">{court.availability}</p>
                  <p className="text-sm font-bold text-green-400">R{court.price_per_hour}/hr</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/courts/${court._id}`} className="text-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:border-gray-600 transition-all">
                  View
                </Link>
                <Link href={`/courts/${court._id}/edit`} className="text-xs px-3 py-2 bg-blue-900/30 border border-blue-800/50 rounded-xl text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1">
                  <FaEdit size={10} /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(court._id)}
                  className="text-xs px-3 py-2 bg-red-950 border border-red-900 rounded-xl text-red-400 hover:bg-red-900/50 hover:border-red-700 transition-all flex items-center gap-1"
                >
                  <FaTrash size={10} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  </div>
);
};

export default MyCourtsPage;