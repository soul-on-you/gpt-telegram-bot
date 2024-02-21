import { Configuration, OpenAIApi } from "openai";
import { amplitude } from ".";

const configurationOpenAI = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(configurationOpenAI);

const MAX_API_TRIES = 3;

async function validateWriteResponse(
  writeCallback: () => ReturnType<typeof openai.createCompletion>
) {
  for (let i = 0; i < MAX_API_TRIES; i++) {
    console.log("send...");
    const response = await writeCallback();

    if (Number(response.data.choices[0].text?.length) > 10)
      return response.data.choices[0].text!;

    amplitude.logEvent({
      event_type: "Bad Write",
      event_properties: {
        type: "essay",
      },
    });
  }

  console.log("Error OPENAI");
  return null;
}

export const writeEssay = async (
  theme: string,
  prev: string | null
): Promise<string | undefined> => {
  console.log(`theme: ${theme}`);
  console.log(`prev: ${prev}`);
  if (prev) {
    const response = await validateWriteResponse(() =>
      openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Перефразируй сочинение на тему '${theme}'.\Сочинение: ${prev}`,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
      })
    );

    if (!response) return prev;
    return response;
  } else {
    const response = await validateWriteResponse(() =>
      openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Напиши сочинение на тему ${theme}. 200 слов`,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
      })
    );

    if (!response) return "Неудалось выполнить запрос";
    return response;
  }
};

export const writeReferat = async (
  theme: string,
  prev: string | null
): Promise<string | undefined> => {
  console.log(`theme: ${theme}`);
  console.log(`prev: ${prev}`);
  if (prev) {
    const response = await validateWriteResponse(() =>
      openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Перефразируй реферат на тему ${theme}.\nРеферат: ${prev}`,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
      })
    );

    if (!response) return prev;
    return response;
  } else {
    const response = await validateWriteResponse(() =>
      openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Напиши реферат на тему ${theme}. 200 слов`,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
      })
    );

    if (!response) return "Неудалось выполнить запрос";
    return response;
  }
};

export const writeFree = async (
  theme: string,
  prev: string | null
): Promise<string | undefined> => {
  console.log(`theme: ${theme}`);
  console.log(`prev: ${prev}`);
  if (prev) {
    const response = await validateWriteResponse(() =>
      openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Перефразируй текст на тему ${theme}.\nТекст: ${prev}`,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
      })
    );

    if (!response) return prev;
    return response;
  } else {
    const response = await validateWriteResponse(() =>
      openai.createCompletion({
        model: "text-davinci-003",
        prompt: theme,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
      })
    );

    if (!response) return "Неудалось выполнить запрос";
    return response;
  }
};

export const changeEssay = async (
  changes: string,
  prev: string
): Promise<string | undefined> => {
  console.log(`changes: ${changes}`);
  console.log(`prev: ${prev}`);

  const response = await validateWriteResponse(() =>
    openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Изменить в сочинение ${changes}.\nСочинение: ${prev}`,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 2048,
    })
  );

  if (!response) return prev;
  return response;
};

export const changeReferat = async (
  changes: string,
  prev: string
): Promise<string | undefined> => {
  console.log(`changes: ${changes}`);
  console.log(`prev: ${prev}`);
  const response = await validateWriteResponse(() =>
    openai.createCompletion({
      model: "text-davinci-003",
      // prompt: `Изменить реферат ${changes}.`,
      prompt: `Изменить в реферате ${changes}.\nРеферат: ${prev}`,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 2048,
    })
  );

  if (!response) return prev;
  return response;
};

export const changeFree = async (
  changes: string,
  prev: string
): Promise<string | undefined> => {
  console.log(`changes: ${changes}`);
  console.log(`prev: ${prev}`);
  const response = await validateWriteResponse(() =>
    openai.createCompletion({
      model: "text-davinci-003",
      // prompt: `Контекст: ${prev}\nИзменить в сочинение ${changes}.`,
      prompt: `Изменить в тексте ${changes}.\nТекст: ${prev}`,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 2048,
    })
  );

  if (!response) return prev;
  return response;
};
