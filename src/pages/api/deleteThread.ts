import { NextApiRequest, NextApiResponse } from "next";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { env } from "../../config/env";

dotenv.config();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { threadId } = req.query;
    const { deleted } = await openai.beta.threads.del(threadId as string);
    res.setHeader(
      "Set-Cookie",
      `sandboxId_${threadId}=; path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`
    );
    res.status(200).json({
      deleted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Please try again.",
    });
  }
}
