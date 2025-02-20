import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { caption, email } = data;

  const findId = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true },
  });

  if (!findId) {
    return NextResponse.json({ message: "User Not Found" }, { status: 400 });
  }
  const newPost = await prisma.post.create({
    data: {
      Caption: caption,
      user: {
        connect: { id: findId.id },
      },
    },
  });
  return NextResponse.json({ message: "Post Successfull" });
}
