import { User } from "@prisma/client";
import { calculateDays } from "../../utils";

export const getAccountMessage = (user: User) =>
  `Привет, ${user?.nickname}!
Ваш баланс💰: ${user?.balance}.
Вы отправили запросов⬆: ${user?.requests}.
Вам понравилось ответов❤: ${user?.likes}.
Вы с нами уже ${calculateDays(user.createdAt)} дней.`;
