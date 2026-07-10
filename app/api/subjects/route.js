export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaGlobal = global;
const prisma = prismaGlobal.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetSemester = parseInt(searchParams.get('semester'));
    const targetYear = parseInt(searchParams.get('year'));
    const course = searchParams.get('course');
    const studentId = parseInt(searchParams.get('studentId'));

    if (!targetSemester || !targetYear || !course) {
      return NextResponse.json({ error: "Missing filtering dimensions." }, { status: 400 });
    }

    // Pull options matching year/sem scope and filters out unauthorized DSE streams
    const eligibleSubjects = await prisma.subject.findMany({
      where: {
        targetYear: targetYear,
        targetSemester: targetSemester,
        OR: [
          { courseSpecific: null },
          { courseSpecific: course }
        ]
      },
      orderBy: { name: 'asc' }
    });

    // Extract current student selections to map selections in UI state
    const currentSelections = await prisma.studentSelection.findMany({
      where: { studentId: studentId }
    });

    return NextResponse.json({ subjects: eligibleSubjects, selections: currentSelections });
  } catch (error) {
    return NextResponse.json({ error: "Failed to gather academic modules." }, { status: 500 });
  }
}