import env from 'env-var';

// import dotenv from "dotenv";

// dotenv.config({ path: "../../.env" });

export const envs = {
  DATABASE_URL: env.get("DATABASE_URL").required().asString(),
  JWT_SEED: env.get("JWT_SEED").required().asString(),

  SEND_EMAIL: env.get("SEND_EMAIL").default("false").asBool(),
  MAILER_HOST: env.get("MAILER_HOST").required().asString(),
  MAILER_EMAIL: env.get("MAILER_EMAIL").required().asString(),
  MAILER_SECRET_KEY: env.get("MAILER_SECRET_KEY").required().asString(),
  MAILER_PORT: env.get("MAILER_PORT").required().asIntPositive(),
  MAILER_USER: env.get("MAILER_USER").required().asString(),

  FRONTEND_URL: env.get("FRONTEND_URL").required().asString(),

  CLOUDINARY_CLOUD_NAME: env.get("CLOUDINARY_CLOUD_NAME").required().asString(),
  CLOUDINARY_API_KEY: env.get("CLOUDINARY_API_KEY").required().asString(),
  CLOUDINARY_API_SECRET: env.get("CLOUDINARY_API_SECRET").required().asString(),

  DEEPSEEK_API_KEY: env.get("DEEPSEEK_API_KEY").required().asString(),
  DEEPSEEK_BASE_URL: env.get("DEEPSEEK_BASE_URL").default("https://api.deepseek.com").asString(),
};