import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    const allowed = ['image/jpeg','image/png','image/webp','video/mp4'];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    const max = 20 * 1024 * 1024; // 20MB
    if (file.size > max) return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadsDir = join(process.cwd(), 'public', 'reviews');
    try { await mkdir(uploadsDir, { recursive: true }); } catch {}
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = join(uploadsDir, name);
    await writeFile(path, bytes);
    return NextResponse.json({ url: `/reviews/${name}` });
  } catch (e) {
    console.error('Review upload error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


