import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  try {
    if (!email) return NextResponse.json({ message: "No Email Found" });
    const links = await prisma.user.findMany({
      where: {
        email: email,
      },
      select: { link: true },
    });
    return NextResponse.json({ links });
  } catch (error) {
    console.log(error);
  }
}
