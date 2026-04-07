import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    let uri = MONGODB_URI;

    // If no external MongoDB URI, spin up an in-memory MongoDB
    if (!uri || uri.includes('localhost:27017')) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');

      // Cache the server instance globally
      if (!(global as any).__mongoServer) {
        const mongoServer = await MongoMemoryServer.create();
        (global as any).__mongoServer = mongoServer;
      }
      uri = (global as any).__mongoServer.getUri();
      console.log('✅ Using in-memory MongoDB');
    }

    cached.promise = mongoose.connect(uri).then(async (m) => {
      // Auto-seed if database is empty
      const { Course } = await import('@/backend/models/Course');
      const count = await Course.countDocuments();
      if (count === 0) {
        const { SAMPLE_COURSES } = await import('@/backend/lib/data');
        await Course.insertMany(SAMPLE_COURSES);
        console.log('🌱 Database seeded with sample courses');
      }

      // Create default admin user
      const { User } = await import('@/backend/models/User');
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await User.create({
          name: 'Admin',
          email: 'admin@educator.com',
          password: hashedPassword,
          role: 'admin',
        });
        console.log('👤 Default admin created (admin@educator.com / admin123)');
      }

      // Seed a demo student and pending enrollment
      const { Enrollment } = await import('@/backend/models/Enrollment');
      const enrollmentCount = await Enrollment.countDocuments();
      if (enrollmentCount === 0) {
        const bcrypt = await import('bcryptjs');
        const studentHash = await bcrypt.hash('student123', 12);
        const student = await User.create({
          name: 'Demo Student',
          email: 'student@demo.com',
          password: studentHash,
          role: 'student',
        });

        await Enrollment.create({
          userId: student._id,
          courseId: '0', // Using index from SAMPLE_COURSES
          status: 'pending',
          receiptUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400', // Dummy receipt
          completedLessons: []
        });
        console.log('📝 Demo pending enrollment created');
      }

      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
