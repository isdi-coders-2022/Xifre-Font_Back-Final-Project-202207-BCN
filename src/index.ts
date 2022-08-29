import "./loadEnvironment";
import express from "express";
import Debug from "debug";
import chalk from "chalk";

const debug = Debug("widescope:index");

const app = express();

app.listen(4000, () => {
  debug(chalk.green("Server listening on port 4000"));
});
