import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message, User, Counselor } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all unique users that the current user has chatted with
    const chatParticipants = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", session.user.id] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $last: "$content" },
          lastMessageDate: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", session.user.id] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageDate: -1 } },
    ]);

    // Get user details for each chat participant
    const chatPromises = chatParticipants.map(async (participant) => {
      const userId = participant._id;
      const user = await User.findById(userId);
      const counselor = await Counselor.findOne({ userId });

      return {
        id: userId,
        userId: userId,
        name: user?.name || "Unknown User",
        imageUrl: counselor?.imageUrl || user?.image || "",
        lastMessage: participant.lastMessage,
        unreadCount: participant.unreadCount,
      };
    });

    const chats = await Promise.all(chatPromises);

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
} 