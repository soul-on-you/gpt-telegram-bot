import { StepScene } from "@puregram/scenes";
import { CallbackQueryContext, MessageContext } from "puregram";
import { backKeyboard, paymentKeyboard } from "../keyboard";
import { getPaymentIntroMessage, getPaymentLinkMessage } from "../messages";
import {
  BackKeyboardCallbackQuery,
  PaymentKeyboardCallbackQuery,
} from "../types";

export const PaymentScene = new StepScene<
  MessageContext | CallbackQueryContext
>("payment", [
  // Payment
  (context) => {
    if (context.scene.step.firstTime) {
      if (context.is("message"))
        return context.send(getPaymentIntroMessage(), {
          reply_markup: paymentKeyboard,
        });
      else {
        return context.message!.editMessageText(getPaymentIntroMessage(), {
          reply_markup: paymentKeyboard,
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

    if (!context.is("callback_query")) {
      return context.delete();
    }

    // Get next action from callback query
    const nextAction = (context.queryPayload as PaymentKeyboardCallbackQuery)
      .type;

    switch (nextAction) {
      case "payment":
        const amount = (context.queryPayload as PaymentKeyboardCallbackQuery)
          .amount;
        context.scene.state.amount = amount;
        return context.scene.step.next();
      case "back":
        context.scene.leave();
        return context.scene.enter("main");
    }
  },
  // Payment link
  (context) => {
    if (context.scene.step.firstTime) {
      if (context.is("message"))
        // @ts-ignore
        return context.send(getPaymentLinkMessage(context), {
          reply_markup: backKeyboard,
        });
      else {
        return context.message!.editMessageText(
          // @ts-ignore
          getPaymentLinkMessage(context),
          { reply_markup: backKeyboard }
        );
      }
    }

    // If user want to leave scene
    if (context.is("message")) {
      if (context.text === "/start") {
        context.scene.leave();
        return context.scene.enter("main");
      }
    }

    if (!context.is("callback_query")) {
      return context.delete();
    }

    // Get next action from callback query
    const nextAction = (context.queryPayload as BackKeyboardCallbackQuery).type;

    switch (nextAction) {
      case "back":
        return context.scene.step.previous();
    }
  },
]);
