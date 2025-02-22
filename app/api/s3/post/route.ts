import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const email = formData.get("email") as string;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: email,
      Body: buffer,
      ContentType: file.type,
    })
  );
  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      imageName: email,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Profile Updated Successfullt",
    },
    { status: 200 }
  );
}
