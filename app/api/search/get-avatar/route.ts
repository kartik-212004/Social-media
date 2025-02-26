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
  const email = searchParams.get("email");

  try {
    if (!id && !email) {
      return NextResponse.json(
        { message: "Please provide either 'id' or 'email'." },
        { status: 400 }
      );
    }

    let user;
    if (id) {
      user = await prisma.user.findUnique({
        where: { id },
        select: { imageName: true, imageUrl: true },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email },
        select: { imageName: true, imageUrl: true },
      });
    }

    console.log("User found:", user);

    if (!user) {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }

    if (!user.imageName && !user.imageUrl) {
      return NextResponse.json({
        message: "No image associated with this user",
        imageUrl: null,
        Link: null,
      });
    }
    let signedUrl = null;
    if (user.imageName) {
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: user.imageName,
      });

      signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 93600,
      });
    }

    return NextResponse.json({
      imageUrl: signedUrl,
      Link: user.imageUrl,
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
