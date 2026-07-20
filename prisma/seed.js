const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database wipe and fresh structural seed...");
  await prisma.studentSelection.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.student.deleteMany({});

  // 📚 SEED COMPREHENSIVE SUBJECT MATRICES
  const subjects = [
    // --- Semester 3 (Year 2) Pool ---
    { type: 'GE', name: 'ACCOUNTING FOR EVERYONE', maxCapacity: 60, targetYear: 2, targetSemester: 3, department: 'COMMERCE' },
    { type: 'GE', name: 'MONEY AND BANKING', maxCapacity: 60, targetYear: 2, targetSemester: 3, department: 'ECONOMICS' },
    { type: 'GE', name: 'MEDIA IN HISTORY', maxCapacity: 60, targetYear: 2, targetSemester: 3, department: 'HISTORY' },
    { type: 'DSE', name: 'FINANCIAL MARKETS AND INSTITUTIONS', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: 'B.COM. (HONS.)', department: 'COMMERCE' },
    { type: 'DSE', name: 'DIGITAL ECONOMICS', maxCapacity: 60, targetYear: 2, targetSemester: 3, courseSpecific: 'BA(H) Economics', department: 'ECONOMICS' },
    { type: 'SEC', name: 'Advanced Spreadsheet Tools', maxCapacity: 60, targetYear: 2, targetSemester: 3 },
    { type: 'VAC', name: 'Yoga: Philosophy and Practice', maxCapacity: 60, targetYear: 2, targetSemester: 3 },

    // --- Semester 5 (Year 3) Pool ---
    { type: 'GE', name: 'FUNDAMENTALS OF HRM', maxCapacity: 60, targetYear: 3, targetSemester: 5, department: 'COMMERCE' },
    { type: 'GE', name: 'LEGAL ENVIRONMENT OF BUSINESS', maxCapacity: 60, targetYear: 3, targetSemester: 5, department: 'BBE' },
    { type: 'DSE', name: 'AUDITING', maxCapacity: 60, targetYear: 3, targetSemester: 5, courseSpecific: 'B.COM. (HONS.)', department: 'COMMERCE' },
    { type: 'DSE', name: 'INVESTMENT PORTFOLIO OPTIMISATION', maxCapacity: 60, targetYear: 3, targetSemester: 5, courseSpecific: 'BBE', department: 'BBE' },
    { type: 'SEC', name: 'E-Tourism', maxCapacity: 60, targetYear: 3, targetSemester: 5 },

    // --- Semester 7 (Year 4) Pool (Complete Computer Science DSE + GE Sets) ---
    { type: 'GE', name: 'PEOPLE MANAGEMENT', maxCapacity: 60, targetYear: 4, targetSemester: 7, department: 'COMMERCE' },
    { type: 'GE', name: 'DYNAMICS OF STARTUPS', maxCapacity: 3, targetYear: 4, targetSemester: 7, department: 'BMS' }, // Small cap to verify full limit UI
    { type: 'GE', name: 'PRINCIPLES OF MICROECONOMICS - II', maxCapacity: 60, targetYear: 4, targetSemester: 7, department: 'ECONOMICS' },
    { type: 'DSE', name: 'RESEARCH METHODOLOGY', maxCapacity: 60, targetYear: 4, targetSemester: 7, courseSpecific: 'BSc(H) Computer Science', department: 'COMPUTER SCIENCE' },
    { type: 'DSE', name: 'CYBER FORENSICS', maxCapacity: 60, targetYear: 4, targetSemester: 7, courseSpecific: 'BSc(H) Computer Science', department: 'COMPUTER SCIENCE' },
    { type: 'DSE', name: 'ADVANCED TCP/IP', maxCapacity: 60, targetYear: 4, targetSemester: 7, courseSpecific: 'BSc(H) Computer Science', department: 'COMPUTER SCIENCE' },
    { type: 'DSE', name: 'BUSINESS RESEARCH METHODOLOGY', maxCapacity: 60, targetYear: 4, targetSemester: 7, courseSpecific: 'B. Com (Hons.)', department: 'COMMERCE' }
  ];
  await prisma.subject.createMany({ data: subjects });

  // 👨‍🎓 SEED DATA MATRIX FOR STUDENTS (Exact Roll Syntaxes)
  const students = [];

  // 1. Complete operational CS 4th Year Roster
  for (let i = 1; i <= 15; i++) {
    const padded = i.toString().padStart(2, '0');
    students.push({
      name: `CS FOURTH YEAR STUDENT ${padded}`,
      rollNumber: `23/CS/${padded}`,
      course: 'BSc(H) Computer Science',
      year: 4,
      semester: 7,
      password: 'cvs@1234'
    });
  }

  // 2. Multi-course multi-year sample distributions
  for (let i = 1; i <= 5; i++) {
    const padded = i.toString().padStart(2, '0');
    students.push({ name: `BBE STUDENT ${padded}`, rollNumber: `24/BBE/${padded}`, course: 'BBE', year: 3, semester: 5, password: 'cvs@1234' });
    students.push({ name: `BCOM STUDENT ${padded}`, rollNumber: `25/BCOM/${padded}`, course: 'B.COM. (HONS.)', year: 2, semester: 3, password: 'cvs@1234' });
  }

  await prisma.student.createMany({ data: students });
  console.log("🎉 Subjects & real user rosters deployed to Neon framework!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
