import "../loadEnvironment";

const environment = {
  debug: process.env.DEBUG,
  port: +process.env.PORT ?? 4000,
  database: process.env.MONGO_DB,
  secret: process.env.AUTH_SECRET,
  client: process.env.CLIENT,
} as const;

export default environment;
