import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import z from "zod";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Weak Password"),
});

export async function POST(req: NextRequest) {
  const data = await req.json();
  const result = userSchema.safeParse(data);
  const { email, password, name } = data;
  try {
    if (!result.success) {
      console.log(result.error.issues[0].message);
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
      select: { email: true },
    });

    if (existingUser) {
      console.log(existingUser);
      return NextResponse.json(
        { message: "User Already Exists", status: 400 },
        { status: 400 }
      );
    }

    const hashing = await bcrypt.hash(password, 10);
    const db: {
      email: string;
      password?: string;
      id: string;
      createdAt: Date;
    } = await prisma.user.create({
      data: { email: email, password: hashing, name: name },
      select: { email: true, password: false, id: true, createdAt: true },
    });
    console.log(db);
    return NextResponse.json(
      {
        message: "Account Created Successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
  }
}
