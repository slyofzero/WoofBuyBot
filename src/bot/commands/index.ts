import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { settings } from "./settings";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    {
      command: "settings",
      description: "Setup custom alerts by tweaking the settings",
    },
  ]);

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("settings", (ctx) => settings(ctx));

  log("Bot commands up");
}
