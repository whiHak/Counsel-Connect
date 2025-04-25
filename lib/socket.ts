import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocket = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected");

      // Join user's room for private messages
      socket.on("join", (userId: string) => {
        socket.join(userId);
      });

      socket.on("message", async (message) => {
        // Broadcast to receiver's room
        io.to(message.receiverId).emit("message", message);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
  return res.socket.server.io;
}; 