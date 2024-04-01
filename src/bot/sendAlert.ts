import { TokenData, TxnData } from "@/types";
import { apiFetcher } from "@/utils/api";
import { cleanUpBotMessage, generateBuyEmojis } from "@/utils/bot";
import { EXPLORER_URL, TOKEN_API } from "@/utils/constants";
import { BOT_USERNAME } from "@/utils/env";
import {
  formatFloat,
  roundUpToDecimalPlace,
  shortenAddress,
  toTitleCase,
} from "@/utils/general";
import { projectGroups } from "@/vars/projectGroups";
import { teleBot } from "..";
import { errorHandler } from "@/utils/handlers";

export async function sendAlert(token: string, txnData: TxnData) {
  const priceData = (await apiFetcher<TokenData>(`${TOKEN_API}/${token}`)).data;
  const firstPair = priceData?.pairs.at(0);

  if (!firstPair) return;

  const { baseToken, fdv, priceUsd, info } = firstPair;
  const { name, symbol } = baseToken;
  const { buyer, buyUsd, buyEth } = txnData;

  const cleanedName = cleanUpBotMessage(name);
  const emojiCount = generateBuyEmojis(buyUsd);
  const shortendReceiver = shortenAddress(buyer);
  const amountReceived = roundUpToDecimalPlace(buyUsd / Number(priceUsd), 2);

  const socialsText = [
    info.socials
      .map(({ type, url }) => `[${toTitleCase(type)}](${url})`)
      .join(" \\| "),
    info.websites
      .map(({ label, url }) => `[${toTitleCase(label)}](${url})`)
      .join(" \\| "),
  ].join(" \\| ");

  const groups = projectGroups.filter(
    ({ token: storedToken }) => storedToken === token
  );

  for (const group of groups) {
    const { emoji, chatid, mediaType, media } = group;
    const emojis = `${emoji || "🟢"}`.repeat(emojiCount);

    const text = `[${cleanedName} Buy!](https://t.me/${BOT_USERNAME})
${emojis}
  
💲 *Spent*: ${cleanUpBotMessage(buyEth)} ETH \\($${cleanUpBotMessage(buyUsd)}\\)
💰 *Got*: ${formatFloat(amountReceived)} ${symbol}
👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/account/${buyer})
📊 *MC*: \\$${fdv.toLocaleString("en")}
🏷 *Price*: \\$${formatFloat(priceUsd)}
🫧 *Socials*: ${cleanUpBotMessage(socialsText)}`;

    // --------------------- Sending message ---------------------
    try {
      if (media) {
        let sendMsgFn = teleBot.api.sendVideo;
        if (mediaType === "photo") {
          // @ts-expect-error Weird types
          sendMsgFn = teleBot.api.sendPhoto;
        }

        await sendMsgFn(chatid, media, {
          caption: text,
          parse_mode: "MarkdownV2",
        });
      } else {
        await teleBot.api.sendMessage(chatid, text, {
          parse_mode: "MarkdownV2",
        });
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
