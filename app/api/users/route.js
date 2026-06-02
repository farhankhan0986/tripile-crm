import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

    const user = await User.create({ name, email, password, role: role || 'agent' });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
