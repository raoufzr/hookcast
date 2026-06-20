import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { serializeAnalysis } from '@/lib/serialize';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const analysis = await db.videoAnalysis.findFirst({
    where: { id: params.id, userId },
    include: { redesigns: { orderBy: { createdAt: 'desc' } }, similarVideos: true },
  });
  if (!analysis) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json(serializeAnalysis(analysis, { redesigns: analysis.redesigns, similarVideos: analysis.similarVideos }));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const result = await db.videoAnalysis.deleteMany({ where: { id: params.id, userId } });
  if (result.count === 0) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
