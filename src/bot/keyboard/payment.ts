import { InlineKeyboardBuilder } from "puregram";

export const paymentKeyboard = new InlineKeyboardBuilder()
  .textButton({
    text: "20 ₽",
    payload: { type: "payment", amount: 20 },
  })
  .textButton({
    text: "240 ₽",
    payload: { type: "payment", amount: 240 },
  })
  .textButton({
    text: "300 ₽",
    payload: { type: "payment", amount: 300 },
  })
  .row()
  .textButton({
    text: "Назад",
    payload: { type: "back" },
  })
  .row();

export interface PaymentKeyboardCallbackQuery {
  type: "back" | "payment";
  amount: number;
}
