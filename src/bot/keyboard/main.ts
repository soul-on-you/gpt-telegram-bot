import { InlineKeyboardBuilder } from "puregram";
import { WriteType } from "../types";

export const mainKeyboard = new InlineKeyboardBuilder()
  .textButton({
    text: "Аккаунт",
    payload: { type: "account" },
  })
  .row()
  .textButton({
    text: "Написать сочинение (20₽)",
    payload: { type: "write", typeWork: "essay", cost: 20 },
  })
  .row()
  .textButton({
    text: "Написать реферат (20₽)",
    payload: { type: "write", typeWork: "referat", cost: 20 },
  })
  .row()
  .textButton({
    text: "Свободный запрос (25₽)",
    payload: { type: "write", typeWork: "free", cost: 25 },
  })
  .row()
  .urlButton({
    text: "Другое",
    url: "https://t.me/danya_vecher",
  })
  .row();

export interface MainKeyboardCallbackQuery {
  type: "account" | "write";
  typeWork: WriteType;
  cost: number;
}
