import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
