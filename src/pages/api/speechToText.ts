import fs from "fs";
import FormData from "form-data";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../config/env";

dotenv.config();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = req.body;
  const base64Audio = body.audio;
  const audio = Buffer.from(base64Audio, "base64");
  const filePath = `tmp/${Date.now()}-input.mp4`;
  fs.writeFileSync(filePath, audio);
  const readStream = fs.createReadStream(filePath);
  try {
    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });
    fs.unlinkSync(filePath);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred during ping to OpenAI. Please try again.",
    });
  }
}
