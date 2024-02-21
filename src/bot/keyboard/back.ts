import { InlineKeyboardBuilder } from "puregram";

export const backKeyboard = new InlineKeyboardBuilder()
  .textButton({
    text: "Назад",
    payload: { type: "back" },
  })
  .row();

export interface BackKeyboardCallbackQuery {
  type: "back";
}
