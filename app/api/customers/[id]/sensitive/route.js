import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SensitiveData from '@/models/SensitiveData';
import Customer from '@/models/Customer';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/auditLogger';
import { encrypt, decrypt } from '@/lib/encryption';
import { SENSITIVE_FIELD_TYPES } from '@/lib/sensitiveFields';

/**
 * GET /api/customers/[id]/sensitive
 * - Super Admin: returns decrypted values
 * - Manager / Agent: returns { fieldType, value: 'Protected' }
 * Audit logs every view by Super Admin.
 */
export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    // Verify customer exists and role has access
    const customer = await Customer.findById(id);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    if (
      decoded.role === 'agent' &&
      customer.assignedAgent?.toString() !== decoded.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const records = await SensitiveData.find({ customerId: id });

    const isSuperAdmin = decoded.role === 'super_admin';

    const fields = records.map((record) => {
      if (isSuperAdmin) {
        // Decrypt for super admin
        let value;
        try {
          value = decrypt(record.encryptedValue, record.iv);
        } catch {
          value = '[Decryption Error]';
        }
        return {
          fieldType: record.fieldType,
          value,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
      } else {
        // Protected for everyone else
        return {
          fieldType: record.fieldType,
          value: 'Protected',
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
      }
    });

    // Audit log every super admin view
    if (isSuperAdmin && records.length > 0) {
      await createAuditLog({
        action: 'sensitive_data_viewed',
        performedBy: decoded.id,
        targetId: id,
        targetModel: 'Customer',
        meta: { fieldTypes: records.map((r) => r.fieldType) },
      });
    }

    return NextResponse.json({ fields });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/customers/[id]/sensitive
 * Body: { fields: [{ fieldType, value }] }
 * Any authenticated role can create/update sensitive data.
 * Values are encrypted before storage.
 * Agents/Managers NEVER receive the plaintext value back — only Super Admin can read via GET.
 */
export async function POST(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const customer = await Customer.findById(id);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    if (
      decoded.role === 'agent' &&
      customer.assignedAgent?.toString() !== decoded.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { fields } = body;

    if (!Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: 'fields array is required.' }, { status: 400 });
    }

    const savedFields = [];

    for (const field of fields) {
      const { fieldType, value } = field;

      if (!SENSITIVE_FIELD_TYPES.includes(fieldType)) {
        return NextResponse.json({ error: `Invalid fieldType: ${fieldType}` }, { status: 400 });
      }

      // Skip empty values — don't store blank entries
      if (!value || value.trim() === '') continue;

      const { encryptedValue, iv } = encrypt(value.trim());

      const existing = await SensitiveData.findOne({ customerId: id, fieldType });

      if (existing) {
        existing.encryptedValue = encryptedValue;
        existing.iv = iv;
        existing.updatedBy = decoded.id;
        await existing.save();

        await createAuditLog({
          action: 'sensitive_data_updated',
          performedBy: decoded.id,
          targetId: id,
          targetModel: 'Customer',
          meta: { fieldType },
        });
      } else {
        await SensitiveData.create({
          customerId: id,
          fieldType,
          encryptedValue,
          iv,
          createdBy: decoded.id,
        });

        await createAuditLog({
          action: 'sensitive_data_created',
          performedBy: decoded.id,
          targetId: id,
          targetModel: 'Customer',
          meta: { fieldType },
        });
      }

      savedFields.push(fieldType);
    }

    // Always return "Protected" — never return plaintext, even to the creator
    return NextResponse.json({
      message: 'Sensitive data saved.',
      savedFields,
      // Fields are always protected in the response regardless of role
      fields: savedFields.map((ft) => ({ fieldType: ft, value: 'Protected' })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
