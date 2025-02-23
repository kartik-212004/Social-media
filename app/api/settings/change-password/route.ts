import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    });
    return NextResponse.json(
      { status: true, message: "Password Updated Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { status: false, message: "Something Went Wrong" },
      { status: 400 }
    );
  }
}
