import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (!id) {
      throw new Error("Post ID is required");
    }

    // First, get the post details to check if it has an image
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        postName: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Delete the image from S3 if it exists
    if (post.postName) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.BUCKET_POST_NAME,
            Key: post.postName,
          })
        );
      } catch (s3Error) {
        console.error("Error deleting from S3:", s3Error);
        // Continue with post deletion even if S3 deletion fails
      }
    }

    // Delete the post and all related likes using Prisma's cascading delete
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "Post and associated data deleted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Delete operation failed:", error);
    return NextResponse.json({ 
      message: "Failed to delete post",
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }, { 
      status: 500 
    });
  } finally {
    await prisma.$disconnect();
  }
}
