import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });

    // Map user data to a flat object for XLSX
    const data = users.map(u => ({
      'Full Name': u.name,
      'Email': u.email,
      'Role': u.role,
      'Phone': u.phone || 'N/A',
      'School/Institute': u.school || 'N/A',
      'Address': u.address || 'N/A',
      'City': u.city || 'N/A',
      'District': u.district || 'N/A',
      'Date of Birth': u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString() : 'N/A',
      'Joined Date': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
    }));

    // Create a new workbook and add the worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=users_export_' + new Date().toISOString().split('T')[0] + '.xlsx'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
