'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTimes, FaSave, FaTrophy, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

// Mock data
const mockEntities = [
  { id: 1, type: 'League', name: 'Monday Night League', status: 'Active' },
  { id: 2, type: 'League', name: 'Wednesday Social League', status: 'Active' },
  { id: 3, type: 'Team', name: 'West Coast Warriors', status: 'Approved' },
  { id: 4, type: 'Event', name: 'Summer Cup 2026', status: 'Upcoming' },
];

export default function AdminEntitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session.user.activeRole !== 'admin') router.push('/');
  }, [status, session, router]);

  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const openPreview = (entity) => {
    setSelectedEntity(entity);
    setEditForm({ ...entity });
    setPreviewOpen(true);
    setAddDropdownOpen(false);
    setEditDropdownOpen(false);
  };

  const handleSave = () => {
    // In a real app, API call goes here
    alert(`Changes confirmed for: ${editForm.name}`);
    setPreviewOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-12 text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              Admin <span className="text-green-400">Entities</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage Leagues, Teams, and Events</p>
          </div>
          <Link href="/admin/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition">
            Back to Dashboard
          </Link>
        </div>

        {/* 2 Dropdown Menus */}
        <div className="flex gap-4 mb-12 relative z-20">
          
          {/* ADD Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setAddDropdownOpen(!addDropdownOpen); setEditDropdownOpen(false); }}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-900/20"
            >
              <FaPlus /> Add Entity
            </button>
            <AnimatePresence>
              {addDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-14 left-0 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 overflow-hidden"
                >
                  <button onClick={() => openPreview({ type: 'League', name: '', isNew: true })} className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-gray-300">Add League</button>
                  <button onClick={() => openPreview({ type: 'Team', name: '', isNew: true })} className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-gray-300">Add Team</button>
                  <button onClick={() => openPreview({ type: 'Event', name: '', isNew: true })} className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-gray-300">Add Event</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* EDIT Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setEditDropdownOpen(!editDropdownOpen); setAddDropdownOpen(false); }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl text-sm font-bold transition-all"
            >
              <FaEdit /> Quick Edit
            </button>
            <AnimatePresence>
              {editDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-14 left-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 overflow-hidden max-h-64 overflow-y-auto"
                >
                  {mockEntities.map(entity => (
                    <button 
                      key={entity.id}
                      onClick={() => openPreview(entity)} 
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm flex justify-between items-center group"
                    >
                      <span className="text-gray-300 group-hover:text-white truncate pr-2">{entity.name}</span>
                      <span className="text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-md">{entity.type}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Dashboard Grid placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 pointer-events-none">
          {mockEntities.map(entity => (
            <div key={entity.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
               <h3 className="font-bold text-white mb-1">{entity.name}</h3>
               <p className="text-xs text-gray-500">{entity.type} &middot; {entity.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-left Preview / Edit Panel */}
      <AnimatePresence>
        {previewOpen && selectedEntity && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewOpen(false)}
              className="fixed inset-0 z-40 bg-gray-950/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 p-6 shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                  {selectedEntity.type === 'League' && <FaTrophy className="text-yellow-500" />}
                  {selectedEntity.type === 'Event' && <FaCalendarAlt className="text-blue-500" />}
                  {selectedEntity.isNew ? `New ${selectedEntity.type}` : `Edit ${selectedEntity.type}`}
                </h2>
                <button onClick={() => setPreviewOpen(false)} className="text-gray-500 hover:text-white transition">
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{selectedEntity.type} Name</label>
                  <input 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter name..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
                  <select 
                    value={editForm.status || 'Active'}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none appearance-none cursor-pointer"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Upcoming</option>
                    <option>Closed</option>
                  </select>
                </div>

                {/* Additional mock fields */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mt-6">
                  <p className="text-xs text-gray-400 font-mono text-center">Form preview loaded based on entity type.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 mt-6 flex gap-3">
                <button 
                  onClick={() => setPreviewOpen(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <FaSave /> Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
