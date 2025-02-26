import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() {
  const Users = await prisma.user.findMany({
    select: {
      name: true,
      id: true,
    },
  });
  return NextResponse.json({ message: "Users", Users });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body) return NextResponse.json({ message: "Body Is Empty" });
  const user = await prisma.user.findUnique({
    where: { id: body.id },
  });
  return NextResponse.json({ user: user });
}
