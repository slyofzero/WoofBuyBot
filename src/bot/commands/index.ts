import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { settings } from "./settings";
import { executeStep } from "../executeStep";
import { isValidEthAddress } from "@/utils/web3";
import { getTokenData } from "../getTokenData";

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

  teleBot.on([":text"], (ctx) => {
    const message = ctx.message?.text || ctx.channelPost?.text;
    if (message && isValidEthAddress(message)) {
      // @ts-expect-error Type not found
      return getTokenData(ctx);
    }

    // @ts-expect-error Type not found
    executeStep(ctx);
  });
  // @ts-expect-error Type not found
  teleBot.on([":media"], (ctx) => executeStep(ctx));
  // @ts-expect-error Type not found
  teleBot.on([":animation", ":video"], (ctx) => executeStep(ctx));

  log("Bot commands up");
}
