import { TokenData, TxnData } from "@/types";
import { apiFetcher } from "@/utils/api";
import {
  cleanUpBotMessage,
  generateBuyEmojis,
  hardCleanUpBotMessage,
} from "@/utils/bot";
import { EXPLORER_URL, TOKEN_API } from "@/utils/constants";
import { BOT_USERNAME } from "@/utils/env";
import { formatFloat, shortenAddress } from "@/utils/general";
import { projectGroups } from "@/vars/projectGroups";
import { teleBot } from "..";
import { errorHandler } from "@/utils/handlers";

export async function sendAlert(txnData: TxnData) {
  const { token } = txnData;
  const priceData = (await apiFetcher<TokenData>(`${TOKEN_API}/${token}`)).data;
  const firstPair = priceData?.pairs.at(0);

  if (!firstPair) return;

  const { priceUsd } = firstPair;
  const {
    receiver,
    version,
    tokenSent,
    tokenReceived,
    amountReceived,
    amountSent,
  } = txnData;

  const buyUsd = parseFloat((amountReceived * Number(priceUsd)).toFixed(2));
  const cleanedName = cleanUpBotMessage(tokenReceived);
  const emojiCount = generateBuyEmojis(buyUsd);
  const shortendReceiver = cleanUpBotMessage(shortenAddress(receiver));

  const groups = projectGroups.filter(
    ({ token: storedToken }) => storedToken === token
  );

  for (const group of groups) {
    const { emoji, chatId, mediaType, media } = group;
    const emojis = `${emoji || "🟢"}`.repeat(emojiCount);

    const text = `[${cleanedName} Buy\\!](https://t.me/${BOT_USERNAME})

${emojis}
  
🔀 *Spent*: ${formatFloat(amountSent)} ${hardCleanUpBotMessage(
      tokenSent
    )} \\($${cleanUpBotMessage(buyUsd)}\\)
🔀 *Got*: ${formatFloat(amountReceived)} ${hardCleanUpBotMessage(tokenReceived)}
👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/account/${receiver}) \\| [*${version}*](${EXPLORER_URL}/transaction/${version}) 
🏷 *Price*: \\$${formatFloat(priceUsd)}
`;

    // --------------------- Sending message ---------------------
    try {
      if (media) {
        if (mediaType === "video") {
          await teleBot.api.sendVideo(chatId, media, {
            caption: text,
            parse_mode: "MarkdownV2",
            // @ts-expect-error disable_web_page_preview not in type
            disable_web_page_preview: true,
          });
        } else {
          await teleBot.api.sendPhoto(chatId, media, {
            caption: text,
            parse_mode: "MarkdownV2",
            // @ts-expect-error disable_web_page_preview not in type
            disable_web_page_preview: true,
          });
        }
      } else {
        await teleBot.api.sendMessage(chatId, text, {
          parse_mode: "MarkdownV2",
          // @ts-expect-error disable_web_page_preview not in type
          disable_web_page_preview: true,
        });
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
