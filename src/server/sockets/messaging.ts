import { Socket, Server } from "socket.io";
import Debug from "debug";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import chalk from "chalk";

const debug = Debug("widescope:messaging");

const messaging = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ...users: string[]
) => {
  debug(chalk.yellow(`Sockets trying to open between users ${users}`));

  io.on("connection", (socket: Socket) => {
    debug(chalk.green("Sockets listening"));

    users.forEach((user: string) => {
      socket.on(
        `MESSAGE_FROM:${user}`,
        async (message: string, receiver: string) => {
          socket.broadcast.emit(`MESSAGE_TO:${receiver}`, message);
          debug(`${user} as sender says ${message}`);
        }
      );
    });
  });
};

export default messaging;
