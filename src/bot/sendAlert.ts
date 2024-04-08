import { TokenData, TokenMetrics, TxnData } from "@/types";
import { apiFetcher } from "@/utils/api";
import {
  cleanUpBotMessage,
  generateBuyEmojis,
  hardCleanUpBotMessage,
} from "@/utils/bot";
import { EXPLORER_URL, TOKEN_API } from "@/utils/constants";
import { BOT_USERNAME, DEXTOOLS_API_KEY } from "@/utils/env";
import {
  formatFloat,
  formatToInternational,
  shortenAddress,
} from "@/utils/general";
import { projectGroups } from "@/vars/projectGroups";
import { teleBot } from "..";
import { errorHandler } from "@/utils/handlers";

export async function sendAlert(txnData: TxnData) {
  const { token } = txnData;
  const groups = projectGroups.filter(
    ({ token: storedToken }) => storedToken === token
  );

  if (!groups.length) return false;

  const [dexSData, dexTData] = await Promise.all([
    apiFetcher<TokenData>(`${TOKEN_API}/${token}`),
    apiFetcher<TokenMetrics>(
      `https://public-api.dextools.io/standard/v2/token/aptos/${token}/info`,
      { "X-API-KEY": DEXTOOLS_API_KEY || "" }
    ),
  ]);

  const priceData = dexSData.data;
  const firstPair = priceData?.pairs.at(0);
  const tokenInfo = dexTData.data?.data;

  if (!firstPair || !tokenInfo) return;

  const { fdv, mcap } = tokenInfo;
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
  const dexToolsLink = `https://www.dextools.io/app/en/aptos/pair-explorer/${token}`;
  const cmcLink = "https://coinmarketcap.com/dexscan/aptos/17-780022-10008/";
  const dexscreenLink = "https://dexscreener.com/aptos/liquidswapv0p5-5234";

  const websiteLink = "https://woofaptos.space/";
  const twitterLink = "https://x.com/woofonaptos/";
  const telegramLink = "https://t.me/WoofOnAptos/";

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
⬆️ *FDV* \\~ $${cleanUpBotMessage(formatToInternational(fdv))}
🔘 *Marketcap* \\~  $${cleanUpBotMessage(formatToInternational(mcap))}
🫧 *Socials* \\- [Website](${websiteLink}) \\| [Twitter](${twitterLink}) \\| [Telegram](${telegramLink})

[⚙️ DexTools](${dexToolsLink}) \\| [📊 CoinMarketCap](${cmcLink})
[🦅 DexScreener](${dexscreenLink})
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
