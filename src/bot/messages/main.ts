import { MessageContext } from "puregram";

const mainMessageText = 
`Я бот 🤖 для работы с лучшей
нейросетью 🧠 от Илона Маска и
Microsoft. С нашей помощью вы можете
написать сочинение 📝, реферат,
придумать название для продукта, найти
ответ на вопрос и даже написать код.
Попробуйте будущее сегодня.`;

export const getMainMessage = (context: MessageContext) =>
  `Привет, ${
    context.from?.firstName ?? context.from?.username
  }!\n${mainMessageText}`;
