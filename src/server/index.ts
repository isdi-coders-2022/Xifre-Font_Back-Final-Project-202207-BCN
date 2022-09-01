import express from "express";
import cors from "cors";
import morgan from "morgan";
import usersRouter from "./routers/usersRouter";
import generalError from "../middlewares/generalError";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CLIENT,
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/users", usersRouter);

app.use(generalError);

export default app;
