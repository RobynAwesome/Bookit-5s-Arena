import { FaUsers } from "react-icons/fa";

export default function ManagerLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <FaUsers size={40} className="text-blue-500 animate-pulse" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
        Loading Manager Portal...
      </p>
    </div>
  );
}
