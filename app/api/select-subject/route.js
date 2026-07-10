import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaGlobal = global;
const prisma = prismaGlobal.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma;

export async function POST(request) {
  try {
    const { studentId, subjectId, category } = await request.json();

    await prisma.$transaction(async (tx) => {
      // 1. Verify existence of target subject choice
      const subject = await tx.subject.findUnique({ where: { id: subjectId } });
      if (!subject) throw new Error("Subject does not exist.");
      if (subject.type !== category) throw new Error("Category type mismatch.");

      // 2. Concurrency check: enforce maximum cap ceiling
      if (subject.enrolledCount >= subject.maxCapacity) {
        throw new Error("Subject Full");
      }

      // 3. Check for existing selection within this specific category block
      const existing = await tx.studentSelection.findUnique({
        where: { studentId_category: { studentId, category } }
      });
      if (existing) throw new Error(`You have already allocated a module for ${category}.`);

      // 4. Increment the enrollment metrics inside Neon safely
      await tx.subject.update({
        where: { id: subjectId },
        data: { enrolledCount: { increment: 1 } }
      });

      // 5. Build mapping records link
      await tx.studentSelection.create({
        data: { studentId, subjectId, category }
      });
    });

    return NextResponse.json({ message: "Allocation processed successfully!" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Execution exception." }, { status: 400 });
  }
}
