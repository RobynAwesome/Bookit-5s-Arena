import Link from 'next/link';
import { FaFutbol } from 'react-icons/fa';
import CourtDetailClient from './CourtDetailClient';
import connectDB from '@/lib/mongodb';
import Court from '@/models/Court';

// Fetch single court directly from MongoDB (avoids URL mismatch in dev)
const getCourt = async (id) => {
  try {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
    await connectDB();
    const court = await Court.findById(id).lean();
    if (!court) return null;
    return JSON.parse(JSON.stringify(court));
  } catch {
    return null;
  }
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const court = await getCourt(id);
  if (!court) return { title: 'Court Not Found' };
  return {
    title: court.name,
    description: court.description || `Book ${court.name} at 5s Arena — floodlit 5-a-side court in Milnerton, Cape Town.`,
  };
}

const CourtPage = async ({ params }) => {
  const { id } = await params;
  const court = await getCourt(id);

  if (!court) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <FaFutbol className="mx-auto text-5xl text-gray-700 mb-4" />
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            Court Not Found
          </h1>
          <Link href="/" className="mt-4 inline-block text-green-400 hover:text-green-300 text-sm">
            ← Back to Courts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm mb-8 transition-colors uppercase tracking-wide"
        >
          ‹ Back to Courts
        </Link>

        {/* Court card — tabs, info cards, booking all handled client-side */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <CourtDetailClient court={court} />
        </div>
      </div>
    </div>
  );
};

export default CourtPage;
