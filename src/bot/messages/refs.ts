import { User } from "@prisma/client";
import { MarkdownV2 } from "puregram";
import dotenv from "dotenv";

dotenv.config();

export const getRefsMessage = (user: User) =>
  `Привет, ${user.nickname}\\!
У нас есть реферальная программа, за
каждого приглашенного друга, купившего
запрос, вы получаете бесплатный запрос\\.

Пользуйтель нейросетью бесплатно
ссылка для приглашения
${MarkdownV2.url(
  `${process.env.BOT_LINK}?start=${user.id}`,
  `${process.env.BOT_LINK}?start=${user.id}`
)}`;

// ${process.env.BOT_LINK}?start=${user?.id}`;
