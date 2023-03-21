import OpenAIStream from "../../utils/openAIStream";

export const config = {
  runtime: "edge",
};

const handler = async (req) => {
  try {
    const { prompt } = await req.json();

    console.log("prompt: ", prompt);

    const stream = await OpenAIStream(prompt);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
