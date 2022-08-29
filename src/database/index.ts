import mongoose from "mongoose";
import Debug from "debug";
import chalk from "chalk";

const debug = Debug("widescope:database:index");

const connectDB = (database: string): Promise<unknown> =>
  new Promise((resolve, reject) => {
    mongoose.connect(database, (error) => {
      if (error) {
        debug(chalk.red(`Error while connecting to the database: ${error}`));
        reject(error);
        return;
      }

      debug(chalk.green("Connected to the database"));
      resolve(true);
    });

    mongoose.set("toJSON", {
      virtuals: true,
      transform: (doc, ret) => {
        const newDocument = { ...ret };
        delete newDocument.password;

        // eslint-disable-next-line no-underscore-dangle
        delete newDocument.__v;
        // eslint-disable-next-line no-underscore-dangle
        delete newDocument._id;

        return newDocument;
      },
    });
  });

export default connectDB;
