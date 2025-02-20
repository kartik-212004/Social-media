import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();
  const { email, id } = await req.json();
  try {
    if (!email) {
      throw new Error("Field Is Empty");
    }
    await prisma.post.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ message: "Post Deleted Successfully" });
  } catch (error) {
    return NextResponse.json({ error: error });
  }
}
