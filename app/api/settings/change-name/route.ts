import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function PATCH(req: NextRequest) {
  const { name, email } = await req.json();
  const modifiedName = await prisma.user.update({
    where: { email: email },
    data: { name: name },
  });
  return NextResponse.json(
    { message: "Name Updated Successfully", name: modifiedName.name },
    { status: 200 }
  );
}
