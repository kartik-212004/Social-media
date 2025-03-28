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

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId: user.id,
      },
    });

    let liked: boolean;

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      liked = false;
    } else {
      await prisma.like.create({
        data: {
          post: { connect: { id: postId } },
          user: { connect: { id: user.id } },
        },
      });
      liked = true;
    }

    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { likes: true },
    });

    const response = NextResponse.json({
      success: true,
      liked,
      likeCount: updatedPost?.likes.length || 0,
      message: liked ? "Post liked successfully" : "Post unliked successfully",
    });

    response.cookies.set('user-email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 
    });

    return response;
  } catch (error) {
    console.error("Like operation failed:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
