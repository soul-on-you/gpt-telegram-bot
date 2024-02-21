import { User } from "@prisma/client";
import { StepScene } from "@puregram/scenes";
import { CallbackQueryContext, MessageContext, RemoveKeyboard } from "puregram";
import { amplitude } from "../..";
import { getUser, updateUserBalance, updateUserLikes } from "../../model";
import { updateUserRequests } from "../../model/updateUser";
import {
  changeEssay,
  changeFree,
  changeReferat,
  writeEssay,
  writeFree,
  writeReferat,
} from "../../openai";
import { backKeyboard } from "../keyboard";
import { writeKeyboard } from "../keyboard";
import {
  getAwaitIsOkayWrittingMessage,
  getAwaitWrittingMessage,
  getChangeWriteMessage,
  getThankForWriteMessage,
  getWriteEssayMessage,
  getWriteFreeMessage,
  getWriteReferatMessage,
} from "../messages";
import {
  MainKeyboardCallbackQuery,
  WriteKeyboardMessageType,
  WriteType,
} from "../types";

export const WriteScene = new StepScene<MessageContext | CallbackQueryContext>(
  "write",
  [
    // Write Essay
    async (context) => {
      if (context.scene.step.firstTime) {
        // Get message for work type
        const message = getWriteMessage(
          (context.scene.state as MainKeyboardCallbackQuery).typeWork
        );

        if (context.is("message"))
          return context.send(message, { reply_markup: backKeyboard });
        else {
          return context.message!.editMessageText(message, {
            reply_markup: backKeyboard,
          });
        }
      }

      // If user choose back query
      if (context.is("callback_query")) {
        context.scene.leave();
        return context.scene.enter("main");
      }

      // If user want to leave scene
      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }

        if (context.hasText()) {
          context.scene.state.theme = context.text;
          context.scene.state.writeCount = 0;
          context.scene.state.changeCount = 0;
          context.scene.state.action = "write"; // "write" | "change"
          context.scene.state.prevAction = "write"; // "write" | "change"
          context.scene.state.isWrite = false;
          context.scene.state.responseWrite = [];
          context.scene.state.responseChange = [];
          // context.scene.state.askAction = false;
          context.scene.state.user = await getUser({
            senderId: context.senderId!,
          });

          return context.scene.step.next();
        }

        return context.delete();
      }
    },
    // Get theme and details for write
    async (context) => {
      if (context.scene.step.firstTime && !context.scene.state.isWrite) {
        if (context.is("message"))
          context.send(getAwaitWrittingMessage(), {
            reply_markup: new RemoveKeyboard(),
          });
        else {
          context.message!.editMessageText(getAwaitWrittingMessage(), {
            reply_markup: new RemoveKeyboard(),
          });
        }

        context.scene.state.isWrite = true;

        if (context.scene.state.action === "write") {
          // Get write attempt
          const attempt = context.scene.state.writeCount;

          // Get write function for work type
          const write = getWrite(
            (context.scene.state as MainKeyboardCallbackQuery).typeWork,
            context.scene.state.user
          );

          // Prev context
          const prev = context.scene.state.writeCount
            ? context.scene.state.prevAction === "write"
              ? context.scene.state.responseWrite[
                  context.scene.state.writeCount - 1
                ]
              : context.scene.state.responseChange[
                  context.scene.state.changeCount - 1
                ]
            : null;

          //! Debug
          // console.log(prev);

          // Write chatgpt generate response
          const response = await write(context.scene.state.theme ?? "", prev);
          context.scene.state.responseWrite[attempt] = response;

          if (attempt === 0) {
            // Update user balance
            await updateUserBalance({
              senderId: context.senderId!,
              amount: -(context.scene.state as MainKeyboardCallbackQuery).cost,
            });
          }

          // Update user requests
          await updateUserRequests({
            senderId: context.senderId!,
            theme: context.scene.state.theme ?? "",
          });

          context.scene.state.writeCount = attempt + 1;
        }

        if (context.scene.state.action === "change") {
          // Get change attempt
          const attempt = context.scene.state.changeCount;

          // Get change function for work type
          const change = getChange(
            (context.scene.state as MainKeyboardCallbackQuery).typeWork,
            context.scene.state.user
          );

          // Prev context
          const prev =
            context.scene.state.prevAction === "write"
              ? context.scene.state.responseWrite[
                  context.scene.state.writeCount - 1
                ]
              : context.scene.state.responseChange[
                  context.scene.state.changeCount - 1
                ];

          //! DEBUG
          // console.log("state Changes:");
          // console.log(context.scene.state.сhanges);
          //! DEBUG

          // Write chatgpt change response
          const response = await change(
            context.scene.state.сhanges ?? "",
            prev ?? ""
          );

          context.scene.state.responseChange[attempt] = response;

          // Update user requests
          await updateUserRequests({
            senderId: context.senderId!,
            theme: context.scene.state.theme ?? "",
            changes: context.scene.state.changes ?? "",
          });

          context.scene.state.changeCount = attempt + 1;
        }

        context.scene.state.isWrite = false;
        return context.scene.step.next();
      }

      // If user want to leave scene
      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }
      }

      context.delete();

      return context.send(getAwaitIsOkayWrittingMessage());
    },
    // Send responce write to user
    async (context) => {
      if (context.scene.step.firstTime) {
        // prettier-ignore
        const { action,  responseWrite,  writeCount,  responseChange,  changeCount } = context.scene.state;

        // prettier-ignore
        const message = action === "write" ? responseWrite[writeCount - 1] : responseChange[changeCount - 1];

        if (context.is("message"))
          return context.send(message, { reply_markup: writeKeyboard });

        if (context.is("callback_query"))
          return context.message?.editMessageText("Выберите действие 👇");
      }

      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }

        switch (context.text as WriteKeyboardMessageType) {
          case "Оценить 💎":
            context.send(getThankForWriteMessage(), {
              reply_markup: new RemoveKeyboard(),
            });

            amplitude.logEvent({
              event_type: "Good essay",
              user_id: context.senderId!.toString(),
              event_properties: {
                theme: context.scene.state.theme,
              },
              user_properties: {
                tgNick: context.name,
                sessionRequestsWrite: context.scene.state.writeCount,
                sessionRequestsChange: context.scene.state.changeCount,
                sessionRequests:
                  context.scene.state.writeCount +
                  context.scene.state.changeCount,
                likes: context.scene.state.user.likes,
                userTotalRequests: context.scene.state.user.requests,
                balance: context.scene.state.user.balance,
              },
            });

            updateUserLikes({
              senderId: context.senderId!,
              theme: context.scene.state.theme,
            });

            context.scene.leave();
            return context.scene.enter("main");
          case "Перегенерировать 👨‍💻":
            context.scene.state.prevAction = context.scene.state.action;
            context.scene.state.action = "write";
            return context.scene.step.previous();
          case "Изменить 👨‍🔬":
            return context.scene.step.next();
          default:
            return context.delete();
        }
      }
    },
    // Get Change theme and details for write
    (context) => {
      if (context.scene.step.firstTime) {
        return context.send(getChangeWriteMessage(), {
          reply_markup: backKeyboard,
        });
      }

      // If user choose back query
      if (context.is("callback_query")) {
        return context.scene.step.previous();
      }

      // If user want to leave scene
      if (context.is("message")) {
        if (context.text === "/start") {
          context.scene.leave();
          return context.scene.enter("main");
        }

        if (context.hasText()) {
          context.scene.state.сhanges = context.text;
          //! DEBUG
          // console.log("state Changes:");
          // console.log(context.scene.state.сhanges);
          //! DEBUG
          context.scene.state.prevAction = context.scene.state.action;
          context.scene.state.action = "change";
          return context.scene.step.go(1);
        }

        return context.delete();
      }
    },
  ]
);

function getWriteMessage(type: WriteType) {
  switch (type) {
    case "essay":
      return getWriteEssayMessage();
    case "referat":
      return getWriteReferatMessage();
    case "free":
      return getWriteFreeMessage();
  }
}

function getWrite(type: WriteType, user: User) {
  switch (type) {
    case "essay":
      // Log click write essay button
      amplitude.logEvent({
        event_type: "User Action: click Write Essay button",
        user_id: user.id.toString(),
        user_properties: {
          tgNick: user.nickname,
        },
      });

      return writeEssay;
    case "referat":
      // Log click write referat button
      amplitude.logEvent({
        event_type: "User Action: click Write Referat button",
        user_id: user.id.toString(),
        user_properties: {
          tgNick: user.nickname,
        },
      });

      return writeReferat;
    case "free":
      // Log click write free message button
      amplitude.logEvent({
        event_type: "User Action: click Write Free Message button",
        user_id: user.id.toString(),
        user_properties: {
          tgNick: user.nickname,
        },
      });

      return writeFree;
  }
}

function getChange(type: WriteType, user: User) {
  switch (type) {
    case "essay":
      // Log click change essay button
      amplitude.logEvent({
        event_type: "User Action: click Change Essay button",
        user_id: user.id.toString(),
        user_properties: {
          tgNick: user.nickname,
        },
      });

      return changeEssay;
    case "referat":
      // Log click change referat button
      amplitude.logEvent({
        event_type: "User Action: click Change Referat button",
        user_id: user.id.toString(),
        user_properties: {
          tgNick: user.nickname,
        },
      });

      return changeReferat;
    case "free":
      // Log click change free message button
      amplitude.logEvent({
        event_type: "User Action: click Change Free Message button",
        user_id: user.id.toString(),
        user_properties: {
          tgNick: user.nickname,
        },
      });

      return changeFree;
  }
}
