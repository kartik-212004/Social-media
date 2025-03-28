import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
// import { getServerSession } from "next-auth";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, postId } = await req.json();
    console.log(userId, postId);

    const checkLikeExists = await prisma.like.findFirst({
      where: { userId: userId, postId: postId },
    });

    if (checkLikeExists) {
      await prisma.like.delete({
        where: {
          id: checkLikeExists.id,
        },
      });
      return NextResponse.json({ message: "Unliked" });
    } else {
      await prisma.like.create({
        data: {
          userId: userId,
          postId: postId,
        },
      });

      const likes = await prisma.like.count({
        where: { postId: postId },
      });
      return NextResponse.json({ message: "Liked", likes: likes });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error });
  }
}

// export async function GET(req: Request) {
//   const session = await getServerSession();
//   if (!session) return NextResponse.json({ liked: false });

//   const { searchParams } = new URL(req.url);
//   const postId = searchParams.get("postId");

//   if (!postId) return NextResponse.json({ liked: false });

//   const existingLike = await prisma.like.findFirst({
//     where: { userId: session.user.id, postId },
//   });

//   return NextResponse.json({ liked: !!existingLike });
// }
