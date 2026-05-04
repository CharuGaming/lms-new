import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { connectDB } from '@/backend/lib/db';
import { ResourceCategory } from '@/backend/models/ResourceCategory';

// GET /api/resources/categories — Fetch all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await ResourceCategory.find().sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/resources/categories — Create a new category (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    await connectDB();
    
    // Check if exists
    const existing = await ResourceCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return NextResponse.json({ error: 'Category already exists' }, { status: 400 });

    const category = await ResourceCategory.create({ name });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
