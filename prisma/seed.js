const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data safely
  await prisma.studentSelection.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.subject.deleteMany({});

  // 1. Seed Subjects for different Categories, Years, and Semesters
  const subjectsData = [
    // Semester 3 (Year 2) - Common GEs, SECs, VACs, and Course-Specific DSEs
    { type: 'GE', name: 'Intro to Economics', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: null },
    { type: 'GE', name: 'Linear Algebra', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: null },
    
    { type: 'SEC', name: 'Web Development Skills', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: null },
    { type: 'SEC', name: 'Data Analysis with Python', maxCapacity: 5, targetYear: 2, targetSemester: 3, courseSpecific: null }, // Small cap for testing full state
    
    { type: 'VAC', name: 'Ethics and Culture', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: null },
    { type: 'VAC', name: 'Environmental Science', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: null },
    
    // DSE is course specific
    { type: 'DSE', name: 'Artificial Intelligence', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: 'B.Sc. (Hons.) Computer Science' },
    { type: 'DSE', name: 'Software Engineering', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: 'B.Sc. (Hons.) Computer Science' },
  ];

  for (const sub of subjectsData) {
    await prisma.subject.create({ data: sub });
  }

  // 2. Seed a test student (Semester 3, Computer Science) with new default alpha-numeric password
  await prisma.student.create({
    data: {
      year: 2,
      semester: 3,
      course: 'B.Sc. (Hons.) Computer Science',
      rollNumber: '23/CS/32',
      password: 'cvs@1234' // Universal alphanumeric access key
    }
  });

  console.log("Database schema successfully seeded with multi-category electives!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
