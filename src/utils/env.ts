import dotenv from "dotenv";

export const { NODE_ENV } = process.env;
dotenv.config({
  path: NODE_ENV === "development" ? ".env" : ".env.production",
});

export const { BOT_TOKEN, BOT_USERNAME, ALCHEMY_API_KEY, FIREBASE_KEY } =
  process.env;
