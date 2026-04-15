import { FaUserShield } from "react-icons/fa";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <FaUserShield size={40} className="text-green-500 animate-pulse" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
        Loading Admin Panel...
      </p>
    </div>
  );
}
