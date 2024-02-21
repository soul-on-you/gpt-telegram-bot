import { User } from "@prisma/client";
import { MarkdownV2 } from "puregram";
import dotenv from "dotenv";

dotenv.config();

export const getRefsStatFailMessage = () =>
  `Для сотрудничества напишите на в
телеграмм ${process.env.BOT_CONTACTS}`;

export const getRefsStatSuccessMessage = (user: User) =>
  `Привет, ${user.nickname}\\!
Спасибо, что работаете с нами\\.
Все реферальные запросы начисляются к
вам на реферальный баланс, напишите для
вывода ${process.env.BOT_CONTACTS}

Ваш реферальный баланс 💰: ${MarkdownV2.bold(
    user.earnedBalance.toFixed(2) + "₽"
  )} 

Вы получаете ${MarkdownV2.bold("40%")} 🤑 с любых
пополнений пользователей, если они
зашли в бота впервые по вашей ссылке\\.

Ссылка для приглашений 👇
${MarkdownV2.url(
  `${process.env.BOT_LINK}?start=${user.id}`,
  `${process.env.BOT_LINK}?start=${user.id}`
)}
`;
