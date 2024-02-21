import { InlineKeyboardBuilder } from "puregram";

export const refsKeyboard = new InlineKeyboardBuilder()
  .textButton({
    text: "Статистика",
    payload: { type: "stats" },
  })
  .row()
  .textButton({
    text: "Назад",
    payload: { type: "back" },
  })
  .row();

export interface RefsKeyboardCallbackQuery {
  type: "stats" | "back";
}
