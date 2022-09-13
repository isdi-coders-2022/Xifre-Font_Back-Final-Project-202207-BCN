import Debug from "debug";
import chalk from "chalk";
import { createServer } from "http";
import app from ".";

const debug = Debug("widescope:server:startServer");

const startServer = (port: number) => {
  const httpServer = createServer(app);
  httpServer.listen(port);

  debug(chalk.green(`Server listening at port ${port}`));

  return httpServer;
};

export default startServer;
