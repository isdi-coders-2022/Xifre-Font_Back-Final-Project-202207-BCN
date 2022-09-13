import { Server as IoServer } from "socket.io";
import { Server } from "http";
import chalk from "chalk";
import Debug from "debug";

const debug = Debug("widescope:socketsServer");

const startSocketsServer = (server: Server) => {
  const io = new IoServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  debug(chalk.green("Opened sockets server"));

  return io;
};

export default startSocketsServer;
