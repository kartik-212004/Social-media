import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 }
    );
  }

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
