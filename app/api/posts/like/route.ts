import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { postId, email } = await req.json();

    if (!postId || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId: user.id,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({
        success: true,
        liked: false,
        message: "Post unliked successfully",
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          post: { connect: { id: postId } },
          user: { connect: { id: user.id } },
        },
      });

      return NextResponse.json({
        success: true,
        liked: true,
        message: "Post liked successfully",
      });
    }
  } catch (error) {
    console.error("Like operation failed:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
