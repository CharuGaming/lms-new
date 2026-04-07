// Sample data for seeding the application
// Videos are loaded dynamically in the VideoHub component

export const SAMPLE_VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'Introduction to Learning Fundamentals', category: 'General', date: 'Mar 2026' },
  { id: 'jNQXAC9IVRw', title: 'Study Techniques That Actually Work', category: 'Study Tips', date: 'Feb 2026' },
  { id: '9bZkp7q19f0', title: 'How to Stay Motivated as a Student', category: 'Motivation', date: 'Feb 2026' },
  { id: 'kJQP7kiw5Fk', title: 'Understanding Complex Concepts Simply', category: 'General', date: 'Jan 2026' },
  { id: 'RgKAFK5djSk', title: 'Top Strategies for Effective Revision', category: 'Study Tips', date: 'Jan 2026' },
  { id: '2Vv-BfVoq4g', title: 'Building a Growth Mindset', category: 'Motivation', date: 'Dec 2025' },
  { id: 'fJ9rUzIMcZQ', title: 'Algebra Basics for Beginners', category: 'Algebra', date: 'Dec 2025' },
  { id: 'hTWKbfoikeg', title: 'Physics: Laws of Motion Explained', category: 'Physics', date: 'Nov 2025' },
  { id: 'YQHsXMglC9A', title: 'Exam Preparation Masterclass', category: 'Exams', date: 'Nov 2025' },
];

export const SAMPLE_COURSES = [
  {
    title: 'Mathematics Fundamentals',
    description: 'Master the core concepts of mathematics from algebra to calculus with clear, step-by-step lessons.',
    thumbnail: '/images/gallery-1.png',
    instructor: 'The Educator',
    category: 'Mathematics',
    price: 0,
    enrolledCount: 1240,
    modules: [
      {
        title: 'Module 1: Number Systems',
        lessons: [
          { title: 'Introduction to Numbers', videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ', content: 'Learn the basics of number systems including natural, whole, integer, and real numbers.', duration: '12 min' },
          { title: 'Operations & Properties', videoUrl: 'https://youtube.com/embed/jNQXAC9IVRw', content: 'Understanding basic operations and their properties.', duration: '15 min' },
        ],
      },
      {
        title: 'Module 2: Algebra Basics',
        lessons: [
          { title: 'Variables & Expressions', videoUrl: 'https://youtube.com/embed/fJ9rUzIMcZQ', content: 'Introduction to algebraic variables and expressions.', duration: '18 min' },
          { title: 'Solving Linear Equations', videoUrl: 'https://youtube.com/embed/9bZkp7q19f0', content: 'Step-by-step guide to solving linear equations.', duration: '20 min' },
        ],
      },
    ],
  },
  {
    title: 'Physics Made Simple',
    description: 'Understand the laws of physics through intuitive explanations, real-world examples, and interactive demonstrations.',
    thumbnail: '/images/gallery-5.png',
    instructor: 'The Educator',
    category: 'Physics',
    price: 0,
    enrolledCount: 890,
    modules: [
      {
        title: 'Module 1: Mechanics',
        lessons: [
          { title: 'Introduction to Forces', videoUrl: 'https://youtube.com/embed/hTWKbfoikeg', content: 'What are forces and how do they affect motion?', duration: '14 min' },
          { title: "Newton's Laws of Motion", videoUrl: 'https://youtube.com/embed/kJQP7kiw5Fk', content: "Understanding Newton's three laws with examples.", duration: '22 min' },
        ],
      },
    ],
  },
  {
    title: 'Exam Preparation Guide',
    description: 'Proven strategies for acing any exam — from time management to advanced memorization techniques.',
    thumbnail: '/images/gallery-2.png',
    instructor: 'The Educator',
    category: 'Study Skills',
    price: 0,
    enrolledCount: 2100,
    modules: [
      {
        title: 'Module 1: Study Strategies',
        lessons: [
          { title: 'Active Recall Method', videoUrl: 'https://youtube.com/embed/RgKAFK5djSk', content: 'How to use active recall to remember anything.', duration: '16 min' },
          { title: 'Spaced Repetition System', videoUrl: 'https://youtube.com/embed/2Vv-BfVoq4g', content: 'Building a spaced repetition system for effective learning.', duration: '19 min' },
          { title: 'Exam Day Tips', videoUrl: 'https://youtube.com/embed/YQHsXMglC9A', content: 'Last-minute tips and strategies for exam day.', duration: '10 min' },
        ],
      },
    ],
  },
  {
    title: 'Digital Literacy & Technology',
    description: 'Navigate the digital world with confidence — learn essential tech skills for academic and professional success.',
    thumbnail: '/images/gallery-6.png',
    instructor: 'The Educator',
    category: 'Technology',
    price: 0,
    enrolledCount: 650,
    modules: [
      {
        title: 'Module 1: Digital Basics',
        lessons: [
          { title: 'Introduction to Computers', videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ', content: 'Understanding computer fundamentals.', duration: '15 min' },
          { title: 'Internet & Web Basics', videoUrl: 'https://youtube.com/embed/jNQXAC9IVRw', content: 'How the internet and web browsers work.', duration: '12 min' },
        ],
      },
    ],
  },
];

export const VIDEO_CATEGORIES = ['All', 'General', 'Study Tips', 'Motivation', 'Algebra', 'Physics', 'Exams'];

export const GALLERY_IMAGES = [
  { src: '/images/gallery-1.png', caption: 'The Classroom' },
  { src: '/images/gallery-2.png', caption: 'Study Session' },
  { src: '/images/gallery-3.png', caption: 'Recording Studio' },
  { src: '/images/gallery-4.png', caption: 'The Library' },
  { src: '/images/gallery-5.png', caption: 'Live Teaching' },
  { src: '/images/gallery-6.png', caption: 'The Workspace' },
];
