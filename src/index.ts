import "./loadEnvironment";
import Debug from "debug";
import chalk from "chalk";
import connectDB from "./database";
import environment from "./configs/environment";
import startServer from "./server/startServer";
import startSocketsServer from "./server/socketsServer";
import messaging from "./server/sockets/messaging";

const debug = Debug("widescope:index");

(async () => {
  debug(chalk.gray("Starting server and connecting to the database"));
  try {
    await connectDB(environment.database);
    const server = startServer(environment.port);
    const io = startSocketsServer(server);
    messaging(io);
  } catch (error) {
    debug(chalk.red("Error while starting the server and the database"));
    process.exit(5);
  }
})();
