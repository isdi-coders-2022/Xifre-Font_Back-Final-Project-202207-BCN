import Debug from "debug";
import chalk from "chalk";
import app from "./index";

const debug = Debug("widescope:server:startServer");

const startServer = (port: number): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      debug(chalk.green(`Server listening on port ${port}`));
      resolve(true);
    });

    server.on("error", (error) => {
      debug(chalk.red(`Error connecting to the server: ${error}`));
      reject(error);
    });
  });

export default startServer;
