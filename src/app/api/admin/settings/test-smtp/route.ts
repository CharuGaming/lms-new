import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { verifySmtp } from '@/backend/services/email.service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { smtpUser, smtpPass } = await req.json();

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: 'SMTP User and Password are required' }, { status: 400 });
    }

    const result = await verifySmtp(smtpUser, smtpPass);

    if (result.success) {
      return NextResponse.json({ message: 'SMTP Connection successful!' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test SMTP Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
