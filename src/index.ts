import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN } from "./utils/env";
import { configureWeb3, processTxn, web3, wssProvider } from "./ethWeb3";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

(async function () {
  configureWeb3();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  if (!wssProvider || !web3) {
    log("wssProvider or web3 is null");
    return false;
  }

  const subscription = await web3.eth.subscribe("newBlockHeaders");

  subscription.on("data", async (blockHeader) => {
    const block = await web3?.eth.getBlock(blockHeader.hash, false);
    log(`Block ${block?.number} caught`);

    for (const txHash of block?.transactions || []) {
      try {
        processTxn(txHash.toString());
      } catch (err) {
        const error = err as Error;
        log(`Error processing transaction ${txHash} - ${error.message}`);
      }
    }
  });
})();
