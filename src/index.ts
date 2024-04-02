import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN } from "./utils/env";
import { configureWeb3, processTxn, web3, wssProvider } from "./ethWeb3";
import { getEthPrice } from "./vars/ethPrice";
import { TransactionExtended } from "./types/web3";
import { syncProjectGroups } from "./vars/projectGroups";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

(async function () {
  configureWeb3();
  await getEthPrice();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([syncProjectGroups()]);

  if (!wssProvider || !web3) {
    log("wssProvider or web3 is null");
    return false;
  }

  // const tx = (await web3?.eth.getTransaction(
  //   "0xaee94da08b38bc58bc08191af7195cb0f1d01128cd09b6a8f72e009aa34074fd"
  // )) as TransactionExtended;
  // processTxn(tx);

  const subscription = await web3.eth.subscribe("newBlockHeaders");
  subscription.on("data", async (blockHeader) => {
    const block = await web3?.eth.getBlock(blockHeader.hash, false);
    log(`Block ${block?.number} caught`);

    if (block && block.transactions) {
      for (const txHash of block.transactions) {
        const tx = (await web3?.eth.getTransaction(
          txHash.toString()
        )) as TransactionExtended;
        processTxn(tx);
      }
    }
  });

  subscription.on("error", (err) => {
    const error = err as Error;
    log(`WS connection error: ${error.message}`);
    process.exit(1);
  });
  wssProvider.on("end", () => {
    log("WS connection closed. Attempting to reconnect...");
    process.exit(1);
  });
  // @ts-expect-error no err type
  wssProvider.on("error", (err) => {
    const error = err as Error;
    log(`WS connection error: ${error.message}`);
    process.exit(1);
  });

  setInterval(() => {
    getEthPrice();
  }, 60 * 1e3);
})();
