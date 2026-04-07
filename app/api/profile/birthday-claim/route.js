export const dynamic = 'force-dynamic';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST — claim free 1hr birthday booking
export async function POST() {
  const session = await getAuthSession();
  if (!session) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  if (!user.birthDate) {
    return Response.json({ error: 'Please add your birth date in your profile first.' }, { status: 400 });
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const birthMonth = user.birthDate.getMonth();
  const birthDay = user.birthDate.getDate();

  // Check if it's within 7 days before or after their birthday
  const birthdayThisYear = new Date(currentYear, birthMonth, birthDay);
  const diffMs = now.getTime() - birthdayThisYear.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < -7 || diffDays > 7) {
    return Response.json({
      error: 'You can claim your free birthday booking within 7 days of your birthday.',
    }, { status: 400 });
  }

  // Check if already claimed this year
  if (user.birthdayClaimedYear === currentYear) {
    return Response.json({
      error: 'You have already claimed your free birthday booking this year.',
    }, { status: 400 });
  }

  // Mark as claimed
  user.birthdayClaimedYear = currentYear;
  // Award bonus referral points for birthday
  user.referralPoints = (user.referralPoints || 0) + 500;
  await user.save();

  return Response.json({
    message: 'Happy Birthday! Your free 1-hour booking has been activated. Use code BDAY' + currentYear + ' when booking. 500 bonus points added!',
    code: 'BDAY' + currentYear,
    bonusPoints: 500,
  });
}
