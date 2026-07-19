import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { rollNumber, password } = await request.json();
    const student = await prisma.student.findUnique({ where: { rollNumber: rollNumber.trim() } });

    if (!student || student.password !== password) {
      return NextResponse.json({ error: "Invalid roll configuration or password entry." }, { status: 401 });
    }

    return NextResponse.json({
      student: { id: student.id, name: student.name, rollNumber: student.rollNumber, course: student.course, year: student.year, semester: student.semester }
    });
  } catch {
    return NextResponse.json({ error: "Fatal authentication exception." }, { status: 500 });
  }
}