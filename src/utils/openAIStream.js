import { createParser } from "eventsource-parser";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const URL = "https://api.openai.com/v1/chat/completions";
const DAVINCI_TURBO = "gpt-3.5-turbo";

export default async function OpenAIStream(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key not configured, please follow instructions in README.md"
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: DAVINCI_TURBO,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that accurately answers queries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.0,
      stream: true,
    }),
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
