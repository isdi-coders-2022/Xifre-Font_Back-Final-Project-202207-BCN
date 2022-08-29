import "./loadEnvironment";
import Debug from "debug";
import chalk from "chalk";
import startServer from "./server/startServer";
import connectDB from "./database";

const debug = Debug("widescope:index");

const port = +process.env.PORT ?? 4000;
const database = process.env.MONGO_DB;

(async () => {
  debug(chalk.gray("Starting server and connecting to the database"));
  try {
    await connectDB(database);
    await startServer(port);
  } catch (error) {
    debug(chalk.red("Error while starting the server and the database"));
    process.exit(1);
  }
})();
