export const dynamic = 'force-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  const session = await getAuthSession();
  if (!session) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate mime type — only allow safe raster image formats (no SVG to prevent XSS)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return Response.json({ error: 'Only JPEG, PNG, GIF and WebP images are allowed.' }, { status: 400 });
    }

    // Validate size — 3 MB max
    if (file.size > 3 * 1024 * 1024) {
      return Response.json({ error: 'Image must be under 3 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    // Use user ID as filename (one file per user, replaces previous)
    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const filename = `${session.user.id}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/avatars/${filename}`;

    // Save to user's profileImage in DB
    await connectDB();
    await User.findByIdAndUpdate(session.user.id, { profileImage: imageUrl });

    return Response.json({ imageUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
