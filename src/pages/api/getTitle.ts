import { Messages, MessageSystem, MessageUser } from "@/types/Model";
import * as dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { env } from "../../config/env";

// Get your environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // Set desired value here
    },
  },
  supportsResponseStreaming: true,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body;
  const messages = (body?.messages || [])
    .filter((message: MessageSystem | MessageUser) => message.content)
    .map(({ files, data, ...message }: any) => message) as any;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      max_tokens: 50,
      messages: [
        ...messages,
        {
          content:
            "Write a 6 words max title (no punctuation) that describes only the content of this chat session. This will be used to help the user find this unique session in the future. Don't include: * The chat session may be about PGA of America * It's a chat session And in the language in which the question was asked. And just return the title with a straight line without the brackets.",
          role: "user",
        },
      ],
    });
    res
      .status(200)
      .json({ title: result.choices.at(0)?.message?.content?.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred during ping to OpenAI. Please try again.",
    });
  }
}
