import { get } from 'env-var';


export const envs = {
  DATABASE_URL: get("DATABASE_URL").required().asString(),
  JWT_SEED: get("JWT_SEED").required().asString(),

  SEND_EMAIL: get("SEND_EMAIL").default("false").asBool(),
  MAILER_HOST: get("MAILER_HOST").required().asString(),
  MAILER_EMAIL: get("MAILER_EMAIL").required().asString(),
  MAILER_SECRET_KEY: get("MAILER_SECRET_KEY").required().asString(),
  MAILER_PORT: get("MAILER_PORT").required().asIntPositive(),
  MAILER_USER: get("MAILER_USER").required().asString(),

  FRONTEND_URL: get("FRONTEND_URL").required().asString(),
};