import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";

const s3client = new S3Client({
  region: process.env.BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

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
