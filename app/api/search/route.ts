import { NextResponse } from "next/server";
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
