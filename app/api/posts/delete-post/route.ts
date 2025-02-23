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

export async function DELETE(req: NextRequest) {
  const prisma = new PrismaClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    if (!id) {
      throw new Error("Field Is Empty");
    }
    const postName = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });

    if (postName?.postName) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.BUCKET_POST_NAME,
          Key: postName?.postName,
        })
      );
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
