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
