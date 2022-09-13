import { Socket } from "socket.io";
import Debug from "debug";

const debug = Debug("widescope:listeners");

const listeners = (socket: Socket, ...users: string[]) => {
  users.forEach((user: string) => {
    socket.on(
      `MESSAGE_FROM:${user}`,
      async (message: string, receiver: string) => {
        socket.broadcast.emit(`MESSAGE_TO:${receiver}`, message);
        debug(`${user} as sender says ${message}`);
      }
    );
  });
};

export default listeners;
