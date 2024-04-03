declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      NODE_ENV: "development" | "production";
      FIREBASE_KEY: string | undefined;
      ALCHEMY_API_KEY: string | undefined;
      OPEN_AI_KEY: string | undefined;
    }
  }
}

export {};
