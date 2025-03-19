import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3client = new S3Client({
  region: process.env.BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = await body;

  if (!email) return NextResponse.json({ message: "no email found" });

  const userId = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true },
  });

  if (!userId) return NextResponse.json({ message: "no email found" });

  const posts = await prisma.post.findMany({
    where: {
      userId: userId.id,
    },
    include: { user: true },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  const signedUrls: Record<string, string> = {};
  
  await Promise.all(
    posts.map(async (post) => {
      if (post.postName) {
        const command = new GetObjectCommand({
          Bucket: process.env.BUCKET_POST_NAME!,
          Key: post.postName,
        });
        signedUrls[post.id] = await getSignedUrl(s3client, command, {
          expiresIn: 93600,
        });
      }
    })
  );

  return NextResponse.json(
    { message: "Posts Fetched", posts: posts, link: signedUrls },
    { status: 200 }
  );
}
