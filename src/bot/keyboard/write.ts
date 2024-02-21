import { KeyboardBuilder } from "puregram";

export const writeKeyboard = new KeyboardBuilder()
  .textButton("Оценить 💎")
  .row()
  .textButton("Перегенерировать 👨‍💻")
  .textButton("Изменить 👨‍🔬")
  .resize()
  .oneTime();

export type WriteKeyboardMessageType =
  | "Оценить 💎"
  | "Перегенерировать 👨‍💻"
  | "Изменить 👨‍🔬";
