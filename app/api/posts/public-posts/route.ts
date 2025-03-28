import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const prisma = new PrismaClient();
const s3client = new S3Client({
  region: process.env.BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const newPost = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            imageName: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const signedUrls: Record<string, string> = {};
    const likeCounts: Record<string, number> = {};

    await Promise.all(
      newPost.map(async (post) => {
        if (post.postName) {
          const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_POST_NAME!,
            Key: post.postName,
          });

          signedUrls[post.id] = await getSignedUrl(s3client, command, {
            expiresIn: 93600,
          });
        }
        likeCounts[post.id] = post.likes?.length || 0;
      })
    );

    return NextResponse.json({
      message: "Post retrieval successful",
      post: newPost,
      link: signedUrls,
      likeCounts: likeCounts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Failed to retrieve posts" },
      { status: 500 }
    );
  }
}
