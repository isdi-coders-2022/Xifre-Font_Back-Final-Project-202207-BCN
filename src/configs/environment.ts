import "../loadEnvironment";

const environment = {
  debug: process.env.DEBUG,
  port: +process.env.PORT,
  database: process.env.MONGO_DB,
  secret: process.env.AUTH_SECRET,
  client: process.env.CLIENT,
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    bucket: process.env.SUPABASE_BUCKET,
  },
} as const;

export default environment;
