import { NextResponse } from "next/server";
import { initSocket } from "@/lib/socket";
import type { NextApiRequest } from "next";
import type { NextApiResponseWithSocket } from "@/lib/socket";

export async function GET(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  try {
    const io = initSocket(req, res);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Socket initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize socket" },
      { status: 500 }
    );
  }
} 