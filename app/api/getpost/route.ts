import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const newPost = await prisma.post.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ message: "Post Successfull", post: newPost });
}
