import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    const { email } = await req.json();

    const searchCriteria = id ? { id } : email ? { email } : null;
    console.log(searchCriteria, "hello");

    if (!searchCriteria) {
      return NextResponse.json(
        { message: "Please provide either 'id' or 'email'." },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: searchCriteria,
      select: { imageName: true },
    });

    if (!user || !user.imageName) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: user.imageName,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 93600,
    });

    return NextResponse.json({ imageUrl: signedUrl });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
