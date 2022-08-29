import { connect } from "mongoose";
import Debug from "debug";
import chalk from "chalk";

const debug = Debug("widescope:database:index");

const connectDB = (database: string): Promise<unknown> =>
  new Promise((resolve, reject) => {
    connect(database, (error) => {
      if (error) {
        debug(chalk.red(`Error while connecting to the database: ${error}`));
        reject(error);
        return;
      }

      debug(chalk.green("Connected to the database"));
      resolve(true);
    });
  });

export default connectDB;
