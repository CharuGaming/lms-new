import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Course } from '@/backend/models/Course';
import { SAMPLE_COURSES } from '@/backend/lib/data';

// POST seed the database with sample courses
export async function POST() {
  try {
    await connectDB();
    const count = await Course.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: 'Database already seeded', count });
    }

    const courses = await Course.insertMany(SAMPLE_COURSES);
    return NextResponse.json({ message: 'Seeded successfully', count: courses.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
