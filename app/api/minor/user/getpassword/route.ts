import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const userPassword = await prisma.user.findUnique({
    where: { email: email },
    select: { password: true },
  });

  if (userPassword?.password) {
    return NextResponse.json({ find: true });
  } else {
    return NextResponse.json({
      find: false,
    });
  }
}
