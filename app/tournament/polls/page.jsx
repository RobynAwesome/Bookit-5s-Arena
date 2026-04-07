'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPoll, FaCheckCircle, FaFutbol, FaStar } from 'react-icons/fa';

const POLLS = [
  {
    id: 1,
    title: 'MVP of the Group Stages',
    description: 'Vote for the most outstanding player in the 5s Arena World Cup group phases.',
    options: [
      { id: 'opt1', text: 'Lionel Messi (Argentina)', votes: 145 },
      { id: 'opt2', text: 'Kylian Mbappé (France)', votes: 132 },
      { id: 'opt3', text: 'Lamine Yamal (Spain)', votes: 89 },
      { id: 'opt4', text: 'Florian Wirtz (Germany)', votes: 76 },
    ],
    isActive: true,
  },
  {
    id: 2,
    title: 'Goal of the Tournament (So Far)',
    description: 'Which goal had you on your feet?',
    options: [
      { id: 'opt5', text: 'Ronaldo vs Spain (Free kick)', votes: 210 },
      { id: 'opt6', text: 'Vinícius Jr vs France (Solo run)', votes: 185 },
      { id: 'opt7', text: 'Son vs Brazil (Volley)', votes: 95 },
    ],
    isActive: true,
  },
  {
    id: 3,
    title: 'Best Goalkeeper',
    description: 'Voting closed on May 28th.',
    options: [
      { id: 'opt8', text: 'Emi Martinez (Argentina)', votes: 340 },
      { id: 'opt9', text: 'Mike Maignan (France)', votes: 210 },
    ],
    isActive: false,
    winner: 'opt8',
  }
];

export default function TournamentPollsPage() {
  const [votedPolls, setVotedPolls] = useState({}); // { pollId: optionId }

  const handleVote = (pollId, optionId) => {
    setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
    // In a real app, send the vote to the API here
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            className="w-20 h-20 mx-auto rounded-full bg-blue-900/30 border border-blue-500/50 flex flex-col items-center justify-center mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FaPoll className="text-blue-400 text-3xl" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-3" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            FAN <span className="text-blue-400">VOTES</span>
          </h1>
          <p className="text-gray-400 text-lg">Have your say in the 5s Arena World Cup awards.</p>
        </div>

        {/* Polls List */}
        <div className="space-y-8">
          {POLLS.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0) + (votedPolls[poll.id] ? 1 : 0);

            return (
              <motion.div 
                key={poll.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-hidden relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {!poll.isActive && (
                  <div className="absolute top-0 right-0 bg-gray-800 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                    Closed
                  </div>
                )}
                
                <h3 className="text-xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                  {poll.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6">{poll.description}</p>

                <div className="space-y-3">
                  {poll.options.map((opt) => {
                    const isVoted = votedPolls[poll.id] === opt.id;
                    const hasVotedThisPoll = !!votedPolls[poll.id];
                    const optVotes = opt.votes + (isVoted ? 1 : 0);
                    const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                    const isWinner = poll.winner === opt.id;

                    return (
                      <div key={opt.id} className="relative">
                        {/* Vote Button / Bar container */}
                        <button
                          onClick={() => poll.isActive && !hasVotedThisPoll && handleVote(poll.id, opt.id)}
                          disabled={!poll.isActive || hasVotedThisPoll}
                          className={`w-full relative overflow-hidden rounded-xl border text-left flex justify-between items-center transition-all p-4 ${
                            isWinner
                              ? 'border-yellow-500 bg-yellow-900/20'
                              : isVoted
                              ? 'border-blue-500 bg-blue-900/20'
                              : 'border-gray-800 bg-gray-800/50 hover:bg-gray-700/50'
                          } ${(poll.isActive && !hasVotedThisPoll) ? 'cursor-pointer hover:border-blue-500/50' : 'cursor-default'}`}
                        >
                          {/* Progress bar background (only visible if voted or closed) */}
                          {(hasVotedThisPoll || !poll.isActive) && (
                            <motion.div 
                              className={`absolute inset-0 opacity-20 ${isWinner ? 'bg-yellow-500' : isVoted ? 'bg-blue-500' : 'bg-gray-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          )}

                          {/* Content */}
                          <div className="relative z-10 flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isWinner ? 'border-yellow-500 text-yellow-500' : isVoted ? 'border-blue-500 text-blue-500' : 'border-gray-500'
                            }`}>
                              {isWinner ? <FaStar size={10} /> : isVoted ? <FaCheckCircle size={10} /> : null}
                            </div>
                            <span className={`text-sm font-bold ${isWinner ? 'text-yellow-400' : isVoted ? 'text-blue-400' : 'text-gray-300'}`}>
                              {opt.text}
                            </span>
                          </div>

                          {/* Percentage (only visible if voted or closed) */}
                          {(hasVotedThisPoll || !poll.isActive) && (
                            <span className={`relative z-10 text-xs font-black tracking-widest ${isWinner ? 'text-yellow-500' : isVoted ? 'text-blue-400' : 'text-gray-500'}`}>
                              {percentage}%
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                {(votedPolls[poll.id] || !poll.isActive) && (
                  <motion.p 
                    className="mt-4 text-center text-xs text-gray-500 font-bold uppercase tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {totalVotes.toLocaleString()} total votes
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
