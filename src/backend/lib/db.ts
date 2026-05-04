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

    // Use in-memory MongoDB ONLY if no MONGODB_URI is provided at all
    if (!uri) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');

      // Cache the server instance globally
      if (!(global as any).__mongoServer) {
        const mongoServer = await MongoMemoryServer.create();
        (global as any).__mongoServer = mongoServer;
      }
      uri = (global as any).__mongoServer.getUri();
      console.log('✅ Using in-memory MongoDB');
    } else {
      console.log('✅ Connecting to Persistent MongoDB');
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

      // Create default admin user using findOneAndReplace with upsert for robustness
      const { User } = await import('@/backend/models/User');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.findOneAndUpdate(
        { email: 'admin@educator.com' },
        { 
          $set: {
            password: hashedPassword,
            role: 'admin'
          },
          $setOnInsert: {
            name: 'Admin',
            email: 'admin@educator.com',
          }
        },
        { upsert: true, new: true }
      );
      console.log('👤 Admin user verified/reset');

      // Seed a demo student and pending enrollment
      const { Enrollment } = await import('@/backend/models/Enrollment');
      const enrollmentCount = await Enrollment.countDocuments();
      if (enrollmentCount === 0) {
        const bcrypt = await import('bcryptjs');
        const studentHash = await bcrypt.hash('student123', 12);
        const student = await User.findOneAndUpdate(
          { email: 'student@demo.com' },
          {
            $setOnInsert: {
              name: 'Demo Student',
              email: 'student@demo.com',
              password: studentHash,
              role: 'student',
            }
          },
          { upsert: true, new: true }
        );

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
