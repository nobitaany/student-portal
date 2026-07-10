import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaGlobal = global;
const prisma = prismaGlobal.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma;

export async function POST(request) {
  try {
    const { course, year, semester, rollNumber, password } = await request.json();

    const student = await prisma.student.findUnique({
      where: { rollNumber: rollNumber }
    });

    if (!student || student.password !== password || student.year !== parseInt(year) || student.semester !== parseInt(semester) || student.course !== course) {
      return NextResponse.json({ error: "Invalid credentials or academic details." }, { status: 401 });
    }

    return NextResponse.json({
      message: "Authentication successful",
      student: { id: student.id, rollNumber: student.rollNumber, name: student.name, semester: student.semester, course: student.course, year: student.year }
    });
  } catch (error) {
    return NextResponse.json({ error: "Server processing fault." }, { status: 500 });
  }
}