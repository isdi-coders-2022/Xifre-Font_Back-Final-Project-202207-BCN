import "./loadEnvironment";
import express from "express";
import Debug from "debug";
import chalk from "chalk";
import cors from "cors";
import morgan from "morgan";

const debug = Debug("widescope:index");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.disable("x-powered-by");

app.listen(4000, () => {
  debug(chalk.green("Server listening on port 4000"));
});
