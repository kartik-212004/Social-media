import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { bio, links, email } = await req.json();

    if (!bio && (!links || links.length === 0)) {
      return NextResponse.json({ message: "Nothing To Update" });
    }

    const userId = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (!userId) return NextResponse.json({ message: "No User Found" });

    if (links && links.length > 0) {
      await Promise.all(
        links.map((url: string) => {
          return prisma.link.create({
            data: { url: url, userId: userId.id },
          });
        })
      );
    }

    if (bio) {
      await prisma.user.update({
        where: { id: userId.id },
        data: { bio: bio },
      });
    }
    return NextResponse.json({ message: "Updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating user", error: error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email)
      return NextResponse.json({ message: "No Email Sent In Params" });

    const userId = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });
    if (!userId) return NextResponse.json({ message: "no user Found" });

    const links = await prisma.link.findMany({
      where: { userId: userId.id },
    });

    const bio = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
      select: { bio: true },
    });
    if (!bio) return NextResponse.json({ message: "empty links" });

    return NextResponse.json({
      message: "Fetched Bio and Links",
      bio: bio.bio,
      links: links,
      id: userId.id,
    });
  } catch (error) {
    return NextResponse.json({ error: error });
  }
}
