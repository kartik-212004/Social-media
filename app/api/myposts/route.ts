import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = await body;

  if (!email) return NextResponse.json({ message: "no email found" });

  const userId = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true },
  });

  if (!userId) return NextResponse.json({ message: "no email found" });

  const posts = await prisma.post.findMany({
    where: {
      userId: userId.id,
    },
    include: { user: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(
    { message: "Posts Fetched", posts: posts },
    { status: 200 }
  );
}
