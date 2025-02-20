import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { photo } = await req.json();
  return NextResponse.json({ image: photo });
}
