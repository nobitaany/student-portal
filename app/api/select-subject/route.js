import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { studentId, selectionsPayload } = await request.json();

    // 1. Guard check for previous locking submissions
    const alreadySelected = await prisma.studentSelection.findFirst({ where: { studentId } });
    if (alreadySelected) {
      return NextResponse.json({ error: "Your profile choices have already been frozen." }, { status: 400 });
    }

    // 2. Run isolated transactional block checking subject ceiling capacities before writing choices
    await prisma.$transaction(async (tx) => {
      for (const item of selectionsPayload) {
        const { subjectId, categorySlot } = item;
        if (!subjectId) continue;

        const subjectData = await tx.subject.findUnique({
          where: { id: parseInt(subjectId) },
          include: { _count: { select: { selections: true } } }
        });

        if (subjectData._count.selections >= subjectData.maxCapacity) {
          throw new Error(`Subject allocation failed: "${subjectData.name}" has reached maximum seat capacity.`);
        }

        await tx.studentSelection.create({
          data: { studentId: parseInt(studentId), subjectId: parseInt(subjectId), categorySlot }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed execution routine." }, { status: 400 });
  }
}