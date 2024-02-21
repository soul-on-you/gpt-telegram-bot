import { Telegram, MessageContext } from "puregram";
import { SessionManager } from "@puregram/session";
import { ContextInterface, SceneManager } from "@puregram/scenes";
import { HearManager } from "@puregram/hear";
import { MaybeArray } from "puregram/types";

import { createUser } from "../model";
import { MainScene, PaymentScene, WriteScene } from "./scenes";

import { amplitude, prisma } from "..";

export const bot = new Telegram({
  token: process.env.BOT_TOKEN,
});

const sessionManager = new SessionManager();
const sceneManager = new SceneManager();
const hearManager = new HearManager();

const events: MaybeArray<"message" | "callback_query"> = [
  "message",
  "callback_query",
];

bot.updates.on(events, sessionManager.middleware);
bot.updates.on(events, sceneManager.middleware);
bot.updates.on(events, sceneManager.middlewareIntercept);
bot.updates.on("message", hearManager.middleware);

sceneManager.addScenes([MainScene, WriteScene, PaymentScene]);

// Handle /start command
hearManager.hear(
  [/^\/start\s\d+$/i, /^\/start$/i],
  async (context: MessageContext & ContextInterface) => {
    if (context.hasViaBot()) return;
    if (!context.senderId) return;
    if (!context.hasText()) return;

    await createUser({
      senderId: context.senderId,
      username: context.chat.username!,
      referalId: +context.text.split(" ")[1],
    });

    return context.scene.enter("main");
  }
);

// Default fallback
// @ts-ignore
hearManager.onFallback((context: MessageContext) => {
  console.log(context);
  context.send("command not found.");
});

// Logging bot errors
bot.updates.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    amplitude.logEvent({
      event_type: "Error bot",
      event_properties: { error: e },
    });
  }
});

export const startBot = () => {
  bot.updates
    .startPolling()
    .then(() => console.log(`started polling @${bot.bot.username}`))
    .catch(console.error);
};
