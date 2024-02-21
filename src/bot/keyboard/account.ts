import { InlineKeyboardBuilder } from "puregram";

export const accountKeyboard = new InlineKeyboardBuilder()
  .textButton({
    text: "Пополнить баланс",
    payload: { type: "pay" },
  })
  .row()
  .textButton({
    text: "Реферальная программа",
    payload: { type: "refs" },
  })
  .row()
  .textButton({
    text: "Назад",
    payload: { type: "back" },
  })
  .row();

export interface AccountKeyboardCallbackQuery {
  type: "refs" | "back" | "pay";
}
