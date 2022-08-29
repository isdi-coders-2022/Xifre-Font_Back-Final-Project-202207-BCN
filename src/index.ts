import "./loadEnvironment";
import Debug from "debug";
import chalk from "chalk";
import startServer from "./server/startServer";

const debug = Debug("widescope:index");

const port = +process.env.PORT ?? 4000;

(async () => {
  debug(chalk.gray("Starting server and connecting to the database"));
  try {
    await startServer(port);
  } catch (error) {
    debug(chalk.red("Error while starting the server and the database"));
    process.exit(1);
  }
})();
