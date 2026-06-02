import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function createAuditLog({ action, performedBy, targetId, targetModel, meta }) {
  try {
    await dbConnect();
    await AuditLog.create({ action, performedBy, targetId, targetModel, meta });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
