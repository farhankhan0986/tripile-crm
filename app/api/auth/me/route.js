import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
