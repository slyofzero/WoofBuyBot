import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { settings } from "./settings";
import { executeStep } from "../executeStep";

export function initiateBotCommands() {
  teleBot.api
    .setMyCommands([
      { command: "start", description: "Start the bot" },
      {
        command: "settings",
        description: "Setup custom alerts by tweaking the settings",
      },
    ])
    .catch(() => null);

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("settings", (ctx) => settings(ctx));

  // @ts-expect-error Type not found
  teleBot.on([":text"], (ctx) => executeStep(ctx));
  // @ts-expect-error Type not found
  teleBot.on([":media"], (ctx) => executeStep(ctx));
  // @ts-expect-error Type not found
  teleBot.on([":animation", ":video"], (ctx) => executeStep(ctx));

  log("Bot commands up");
}
