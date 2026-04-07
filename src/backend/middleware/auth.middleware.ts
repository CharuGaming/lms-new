/**
 * Unified Middleware for Next.js App Router API Routes.
 * Abstracts security logic away from business endpoints.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { Enrollment } from '@/backend/models/Enrollment';
import { connectDB } from '@/backend/lib/db';

type RouteHandler = (request: Request, context: any, user: { id: string, role: string }) => Promise<Response | NextResponse>;

/**
 * Ensures user is authenticated before calling standard route logic.
 */
export function requireAuth(handler: RouteHandler) {
  return async (request: Request, context: any) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Missing Authentication Session' }, { status: 401 });
    }
    
    const user = {
      id: (session.user as any).id,
      role: (session.user as any).role || 'student',
    };
    
    return handler(request, context, user);
  }
}

/**
 * Ensures user is authenticated AND explicitly mapped to 'admin' or 'teacher' role.
 */
export function requireAdminOrTeacher(handler: RouteHandler) {
  return requireAuth(async (request, context, user) => {
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden: Requires Admin or Teacher Permissions' }, { status: 403 });
    }
    return handler(request, context, user);
  });
}

/**
 * Ensures user is authenticated AND enrolled in a specific course before calling standard route logic.
 */
export function requireEnrollment(getCourseIdFromContext: (request: Request, context: any) => Promise<string | null>, handler: RouteHandler) {
  return requireAuth(async (request, context, user) => {
    // Let Teachers and Admins bypass generic course enrollment locks automatically
    if (user.role === 'admin' || user.role === 'teacher') {
      return handler(request, context, user);
    }
    
    const courseId = await getCourseIdFromContext(request, context);
    if (!courseId) {
       return NextResponse.json({ error: 'Require Enrollment: Invalid Course ID' }, { status: 400 });
    }

    await connectDB();
    const isEnrolled = await Enrollment.findOne({
       userId: user.id,
       courseId: courseId,
       status: 'approved'
    });

    if (!isEnrolled) {
       return NextResponse.json({ error: 'Forbidden: You must be enrolled and approved to access this resource.' }, { status: 403 });
    }

    return handler(request, context, user);
  });
}
