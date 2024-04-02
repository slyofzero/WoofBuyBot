import { CallbackQueryContext, CommandContext, Context } from "grammy";
import { log } from "@/utils/handlers";
import { userState } from "@/vars/state";
import { setEmoji, setEmojiCallBack } from "./setEmoji";
import { removeEmoji, removeEmojiCallback } from "./removeEmoji";
import { setMedia, setMediaCallback } from "./setMedia";
import { removeMedia, removeMediaCallback } from "./removeGif";

const steps: { [key: string]: any } = {
  setEmoji: setEmojiCallBack,
  userSetEmoji: setEmoji,

  removeEmoji: removeEmojiCallback,
  userRemoveEmoji: removeEmoji,

  setMedia: setMediaCallback,
  userSetMedia: setMedia,

  removeMedia: removeMediaCallback,
  userRemoveMedia: removeMedia,
};

export async function executeStep(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const chatId = ctx.chat?.id;
  if (!chatId) return ctx.reply("Please redo your action");

  const queryCategory = ctx.callbackQuery?.data?.split("-").at(0);
  const step = userState[chatId] || queryCategory || "";
  const stepFunction = steps[step];

  if (stepFunction) {
    stepFunction(ctx);
  } else {
    log(`No step function for ${queryCategory} ${userState[chatId]}`);
  }
}
