import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { id } = await params;
    const { name, role, isActive, password } = await request.json();

    const updateData = { name, role, isActive };

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { id } = await params;

    if (id === decoded.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await User.findByIdAndUpdate(id, { isActive: false });
    return NextResponse.json({ message: 'User deactivated' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
