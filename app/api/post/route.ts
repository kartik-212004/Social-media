import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3client = new S3Client({
  region: process.env.BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const caption = formData.get("caption") as string;
    const email = formData.get("email") as string;

    if (!caption && !email) {
      return NextResponse.json(
        { message: "Empty email and caption" },
        { status: 400 }
      );
    }

    let fileHash: string | null = null;

    if (file instanceof File) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      console.log(buffer);

      fileHash = crypto
        .createHash("sha256")
        .update(caption || email)
        .digest("hex");

      await s3client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_POST_NAME!,
          Key: fileHash,
          Body: buffer,
          ContentType: file.type,
        })
      );
    }

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
        postName: fileHash,
        user: {
          connect: { id: findId.id },
        },
      },
    });

    return NextResponse.json({ message: "Post Successful" });
  } catch (error) {
    console.error("Error in POST API:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
