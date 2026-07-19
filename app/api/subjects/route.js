import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const course = searchParams.get('course');
  const year = parseInt(searchParams.get('year'));
  const semester = parseInt(searchParams.get('semester'));
  const studentId = parseInt(searchParams.get('studentId'));

  try {
    // Core filtering criteria logic based on year metadata criteria
    const subjects = await prisma.subject.findMany({
      where: {
        targetYear: year,
        targetSemester: semester,
        OR: [ { courseSpecific: course }, { courseSpecific: null } ]
      },
      include: { _count: { select: { selections: true } } }
    });

    const existingSelections = await prisma.studentSelection.findMany({
      where: { studentId: studentId }
    });

    return NextResponse.json({ subjects, existingSelections });
  } catch {
    return NextResponse.json({ error: "Database reading engine failure." }, { status: 500 });
  }
}