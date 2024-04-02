import { onlyAdmin } from "@/utils/bot";
import { CommandContext, Context, InlineKeyboard } from "grammy";

export async function settings(ctx: CommandContext<Context>) {
  const { type } = ctx.chat;

  let text = "";
  if (type === "private") {
    text = "Only works in groups or channels";
    ctx.reply(text);
    return false;
  }

  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  text =
    "Customize your bot here. You can customize the message the bot would send to fit your project.";
  const keyboard = new InlineKeyboard()
    .text("Set emoji", "setEmoji")
    .text("Set media", "setMedia")
    .row()
    .text("Remove emoji", "removeEmoji")
    .text("Remove media", "removeMedia");

  ctx.reply(text, { reply_markup: keyboard });
}
