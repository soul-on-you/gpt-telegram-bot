import { User } from "@prisma/client";
import { StepScene } from "@puregram/scenes";
import { CallbackQueryContext, MessageContext, RemoveKeyboard } from "puregram";
import { amplitude } from "../..";
import { getUser } from "../../model";

import {
  backKeyboard,
  mainKeyboard,
  refsKeyboard,
  accountKeyboard,
} from "../keyboard";
import {
  AccountKeyboardCallbackQuery,
  BackKeyboardCallbackQuery,
  MainKeyboardCallbackQuery,
  RefsKeyboardCallbackQuery,
} from "../keyboard/types";
import {
  getAccountMessage,
  getMainMessage,
  getRefsMessage,
  getRefsStatFailMessage,
  getRefsStatSuccessMessage,
} from "../messages";

export const MainScene = new StepScene<MessageContext | CallbackQueryContext>(
  "main",
  [
    // Main
    async (context) => {
      if (context.scene.step.firstTime) {
        if (context.is("message")) {
          const message = await context.send("Загрузка ...", {
            reply_markup: new RemoveKeyboard(),
          });

          (await message).delete();
          return await context.send(getMainMessage(context), {
            reply_markup: mainKeyboard,
          });
        } else {
          // @ts-ignore
          return context.message.editMessageText(getMainMessage(context), {
            reply_markup: mainKeyboard,
          });
        }
      }

      // If user want to leave scene
      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }
      }

      // If user send message or something else
      if (!context.is("callback_query")) {
        return context.delete();
      }

      // Get next action from callback query
      const nextAction = (context.queryPayload as MainKeyboardCallbackQuery)
        .type;

      // Switch to next step
      switch (nextAction) {
        case "account":
          // Log click account button
          amplitude.logEvent({
            event_type: "User Action: click account",
            user_id: context.senderId.toString(),
            user_properties: {
              tgNick: context.name,
            },
          });

          return context.scene.step.next();
        case "write":
          context.scene.leave();

          const user = await getUser({ senderId: context.senderId! });

          // If user not found in DB
          if (!user) {
            const errorMessage =
              "Что-то пошло не так. Попробуйте позже или напишите /start";
            context.send(errorMessage);
            return context.scene.leave();
          }

          // Log click write button
          amplitude.logEvent({
            event_type:
              "User Action: click Write " +
              (context.queryPayload as MainKeyboardCallbackQuery).typeWork,
            user_id: context.senderId.toString(),
            user_properties: {
              tgNick: context.name,
              balance: user.balance,
            },
          });

          // If user balance is not enough
          if (
            user.balance <
            (context.queryPayload as MainKeyboardCallbackQuery).cost
          ) {
            return context.scene.enter("payment");
          }

          // If user balance is enough - go to write scene
          return context.scene.enter("write", {
            state: context.queryPayload as MainKeyboardCallbackQuery,
          });
      }
    },
    // Account
    async (context) => {
      if (context.scene.step.firstTime) {
        const user = await getUser({ senderId: context.senderId! });

        // If user not found in DB
        if (!user) {
          const errorMessage =
            "Что-то пошло не так. Попробуйте позже или напишите /start";
          context.send(errorMessage);
          return context.scene.leave();
        }

        context.scene.state.user = user;

        return context.message.editMessageText(getAccountMessage(user), {
          reply_markup: accountKeyboard,
        });
      }

      // If user want to leave scene
      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }
      }

      // If user send message or something else
      if (!context.is("callback_query")) {
        return context.delete();
      }

      // Get next action from callback query
      const nextAction = (context.queryPayload as AccountKeyboardCallbackQuery)
        .type;

      switch (nextAction) {
        case "pay":
          // Log click pay button
          amplitude.logEvent({
            event_type: "User Action: click Pay in account",
            user_id: context.senderId.toString(),
            user_properties: {
              tgNick: context.name,
              balance: context.scene.state.user!.balance,
            },
          });

          context.scene.leave();
          return context.scene.enter("payment");
        case "refs":
          // Log click refs button
          amplitude.logEvent({
            event_type: "User Action: click Refecal in account",
            user_id: context.senderId.toString(),
            user_properties: {
              tgNick: context.name,
              isInfluencer: context.scene.state.user!.isInfluencer,
              totalReferalCount: context.scene.state.user!.totalReferalCount,
              balance: context.scene.state.user!.balance,
            },
          });

          return context.scene.step.next();
        case "back":
          return context.scene.step.previous();
      }
    },
    // Refs
    async (context) => {
      if (context.scene.step.firstTime) {
        const user = await getUser({ senderId: context.senderId! });

        // If user not found in DB
        if (!user) {
          const errorMessage =
            "Что-то пошло не так. Попробуйте позже или напишите /start";
          context.send(errorMessage);
          return context.scene.leave();
        }

        return context.message.editMessageText(getRefsMessage(user), {
          reply_markup: refsKeyboard,
          parse_mode: "MarkdownV2",
        });
      }

      // If user want to leave scene
      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }
      }

      // If user send message or something else
      if (!context.is("callback_query")) {
        return context.delete();
      }

      // Get next action from callback query
      const nextAction = (context.queryPayload as RefsKeyboardCallbackQuery)
        .type;

      switch (nextAction) {
        case "stats":
          return context.scene.step.next();
        case "back":
          return context.scene.step.previous();
      }
    },
    // Refs stats
    async (context) => {
      if (context.scene.step.firstTime) {
        const user = await getUser({ senderId: context.senderId! });

        // If user not found in DB
        if (!user) {
          const errorMessage =
            "Что-то пошло не так. Попробуйте позже или напишите /start";
          context.send(errorMessage);
          return context.scene.leave();
        }

        // Log click stats button
        amplitude.logEvent({
          event_type: "User Action: click Stats in account",
          user_id: user?.id.toString(),
          user_properties: {
            tgNick: context.name,
            isInfluencer: user!.isInfluencer,
          },
        });

        if (!user.isInfluencer) {
          return context.message.editMessageText(getRefsStatFailMessage(), {
            reply_markup: backKeyboard,
            //   parse_mode: "MarkdownV2",
          });
        }

        return context.message.editMessageText(
          getRefsStatSuccessMessage(user),
          {
            reply_markup: backKeyboard,
            parse_mode: "MarkdownV2",
          }
        );
      }

      // If user want to leave scene
      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }
      }

      // If user send message or something else
      if (!context.is("callback_query")) {
        return context.delete();
      }

      // Get next action from callback query
      const nextAction = (context.queryPayload as BackKeyboardCallbackQuery)
        .type;

      switch (nextAction) {
        case "back":
          return context.scene.step.previous();
      }
    },
  ]
);
