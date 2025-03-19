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
  try {
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: "Please provide an array of user IDs" },
        { status: 400 }
      );
    }

    // Fetch all users in a single database query
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        imageName: true,
        imageUrl: true,
      },
    });

    // Create a mapping of user IDs to URLs
    const avatarUrls: Record<string, string> = {};

    // Process all avatar URLs in parallel
    await Promise.all(
      users.map(async (user) => {
        if (!user.imageName && !user.imageUrl) {
          return;
        }

        if (user.imageName) {
          const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: user.imageName,
          });

          try {
            const signedUrl = await getSignedUrl(s3Client, command, {
              expiresIn: 93600,
            });
            avatarUrls[user.id] = signedUrl;
          } catch (error) {
            console.error(`Error generating signed URL for user ${user.id}:`, error);
            // Fall back to imageUrl if available
            if (user.imageUrl) {
              avatarUrls[user.id] = user.imageUrl;
            }
          }
        } else if (user.imageUrl) {
          avatarUrls[user.id] = user.imageUrl;
        }
      })
    );

    return NextResponse.json({
      avatarUrls,
    });
  } catch (error) {
    console.error("Error fetching batch avatars:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 