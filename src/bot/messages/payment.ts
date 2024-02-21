import { StepContext } from "@puregram/scenes";
import { MessageContext } from "puregram";
import dotenv from "dotenv";

dotenv.config();

export const getPaymentIntroMessage = () => "Пополнение баланса 💸";

export const getPaymentLinkMessage = (
  context: MessageContext & StepContext<{ amount: number }>
) =>
  `Перейдите по ссылке для пополнения:
https://${process.env.DOMAIN}/pay?id=${context.senderId}&amount=${context.scene.state.amount}`;
