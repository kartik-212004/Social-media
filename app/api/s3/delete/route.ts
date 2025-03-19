import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 }
    );
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: email,
      })
    );

    return NextResponse.json(
      { message: `Deleted image for ${email}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}