import "./loadEnvironment";
import Debug from "debug";
import chalk from "chalk";
import startServer from "./server/startServer";
import connectDB from "./database";
import environment from "./configs/environment";

const debug = Debug("widescope:index");

(async () => {
  debug(chalk.gray("Starting server and connecting to the database"));
  try {
    await connectDB(environment.database);
    await startServer(environment.port);
  } catch (error) {
    debug(chalk.red("Error while starting the server and the database"));
    process.exit(5);
  }
})();
