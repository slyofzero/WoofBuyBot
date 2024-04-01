// eslint-disable-next-line
export function cleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#");

  return text;
}

// eslint-disable-next-line
export function hardCleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/_/g, "\\_")
    .replace(/\|/g, "\\|")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/`/g, "\\`")
    .replace(/\+/g, "\\+")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#")
    .replace(/\*/g, "\\*");

  return text;
}

const randomizeEmojiCount = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function generateBuyEmojis(buy: number) {
  let emojiCount = 0;
  if (buy <= 10) {
    emojiCount = randomizeEmojiCount(5, 10);
  } else if (buy <= 50) {
    emojiCount = randomizeEmojiCount(10, 35);
  } else if (buy <= 100) {
    emojiCount = randomizeEmojiCount(35, 70);
  } else if (buy > 1000) {
    emojiCount = randomizeEmojiCount(150, 200);
  } else {
    emojiCount = randomizeEmojiCount(70, 100);
  }

  return emojiCount;
}

import { Context } from "grammy";

export async function onlyAdmin(ctx: Context) {
  if (!ctx.chat) {
    return;
  }
  // Channels and private chats are only postable by admins
  if (["channel", "private"].includes(ctx.chat.type)) {
    return true;
  }
  // Anonymous users are always admins
  if (ctx.from?.username === "GroupAnonymousBot") {
    return true;
  }
  // Surely not an admin
  if (!ctx.from?.id) {
    return;
  }
  // Check the member status
  const chatMember = await ctx.getChatMember(ctx.from.id);
  if (["creator", "administrator"].includes(chatMember.status)) {
    return true;
  }
  // Not an admin
  return false;
}
