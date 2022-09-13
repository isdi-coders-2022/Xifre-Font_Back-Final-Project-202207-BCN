import { Socket, Server } from "socket.io";
import Debug from "debug";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import chalk from "chalk";
import listeners from "./listeners";

const debug = Debug("widescope:messaging");

const messaging = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  debug(chalk.yellow("Sockets ready"));

  io.on("connection", (socket: Socket) => {
    debug(chalk.green("Sockets listening"));

    listeners(socket);
  });
};

export default messaging;
