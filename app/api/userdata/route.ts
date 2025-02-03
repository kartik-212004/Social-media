import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  console.log(name, email);
  const modifiedName = await prisma.user.update({
    where: { email: email },
    data: { name: name },
  });
  console.log(modifiedName);
  return NextResponse.json(
    { message: "Name Updated Successfully", name: name },
    { status: 200 }
  );
}
