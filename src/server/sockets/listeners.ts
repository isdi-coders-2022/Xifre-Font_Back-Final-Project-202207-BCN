import { Socket } from "socket.io";
import Debug from "debug";
import { User } from "../../database/models/User";

const debug = Debug("widescope:listeners");

const listeners = async (socket: Socket) => {
  const dbUsers = await User.find({});

  dbUsers.forEach((user) => {
    socket.on(
      `MESSAGE_FROM:${user.id}`,
      async (message: string, receiver: string) => {
        socket.broadcast.emit(`MESSAGE_TO:${receiver}`, message);
        debug(`${user.name} to ${receiver}: ${message}`);
      }
    );
  });
};

export default listeners;
